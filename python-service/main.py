"""
Word Learning App - Python Microservice (v2.2)
Vektör embedding, cross-encoding ve "In-place Reflow" PDF metin çıkarma servisi.
Bu sürüm, PDF satır kırılımı (line-break) sorunlarını blok düzeyinde çözer.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, CrossEncoder
import numpy as np
from typing import List, Optional
import logging
import os
import re
import io

# PyMuPDF için
import fitz  # PyMuPDF

# OCR için (opsiyonel)
try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

# Logging yapılandırması
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI uygulaması
app = FastAPI(
    title="Word Learning Python Service",
    description="Vektör embedding, cross-encoding ve akıllı PDF metin çıkarma servisi",
    version="2.2.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model yükleme (lazy loading)
embedding_model = None
cross_encoder_model = None

EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
CROSS_ENCODER_MODEL_NAME = os.getenv("CROSS_ENCODER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")


def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")
        embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        logger.info("Embedding model loaded successfully")
    return embedding_model


def get_cross_encoder_model():
    global cross_encoder_model
    if cross_encoder_model is None:
        logger.info(f"Loading cross-encoder model: {CROSS_ENCODER_MODEL_NAME}")
        cross_encoder_model = CrossEncoder(CROSS_ENCODER_MODEL_NAME)
        logger.info("Cross-encoder model loaded successfully")
    return cross_encoder_model


# ============================================================
# PDF METİN ÇIKARMA SERVİSİ (v2.2 - BLOCK REFLOW)
# ============================================================

class PDFTextExtractor:
    """
    PDF'den metin çıkarma sınıfı - v2.2
    Blok tabanlı 'Reflow' tekniği kullanır:
    Her metin bloğunu alır, içindeki satırları birleştirir, sonra blokları birleştirir.
    """
    
    # Yaygın header/footer kalıpları
    HEADER_FOOTER_PATTERNS = [
        r'^\s*Page\s*\d+\s*(of\s*\d+)?\s*$',
        r'^\s*\d+\s*$',  # Sadece sayfa numarası
        r'^\s*-\s*\d+\s*-\s*$',
        r'^\s*\[\s*\d+\s*\]\s*$',
        r'^\s*©.*$',
        r'^\s*All rights reserved.*$',
        r'^\s*Confidential.*$',
        r'^\s*www\..*$',
        r'^\s*http[s]?://.*$',
    ]
    
    def __init__(self, use_ocr: bool = True):
        self.use_ocr = use_ocr and OCR_AVAILABLE
        self.header_footer_regex = [re.compile(p, re.IGNORECASE) for p in self.HEADER_FOOTER_PATTERNS]
    
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> dict:
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            pages_text = []
            total_text = ""
            method = "text"
            ocr_pages = 0
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Sayfa işleme (Reflow mantığı burada çalışır)
                page_content = self._process_page(page)
                
                # OCR Fallback: Eğer sayfadan anlamlı metin çıkmadıysa
                if len(page_content.strip()) < 50 and self.use_ocr:
                    ocr_text = self._extract_text_with_ocr(page)
                    # OCR çıktısını da aynı temizleme sürecinden geçir
                    ocr_text = self._post_process_raw_text(ocr_text)
                    
                    if len(ocr_text.strip()) > len(page_content.strip()):
                        page_content = ocr_text
                        ocr_pages += 1
                
                if page_content:
                    pages_text.append(page_content)
                    total_text += page_content + "\n\n"
            
            doc.close()
            
            # Metot raporlama
            if ocr_pages == 0:
                method = "text"
            elif ocr_pages == len(pages_text):
                method = "ocr"
            else:
                method = "mixed"
            
            return {
                "text": total_text.strip(),
                "pages": pages_text,
                "page_count": len(pages_text),
                "method": method,
                "success": True,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"PDF extraction error: {str(e)}")
            return {
                "text": "",
                "pages": [],
                "page_count": 0,
                "method": "error",
                "success": False,
                "error": str(e)
            }
    
    def _process_page(self, page) -> str:
        """
        Sayfadaki blokları alır ve yerinde birleştirir (In-place Merge).
        """
        # sort=True: Okuma sırasına göre (yukarıdan aşağı, soldan sağa) blokları getirir.
        blocks = page.get_text("blocks", sort=True)
        
        block_texts = []
        
        for block in blocks:
            # block yapısı: (x0, y0, x1, y1, "text", block_no, block_type)
            if block[6] == 0:  # Sadece metin blokları
                raw_text = block[4]
                
                # Header/Footer ise atla
                if self._is_header_footer(raw_text):
                    continue
                
                # Blok içini temizle ve satırları birleştir
                cleaned_block = self._clean_block_text(raw_text)
                
                if cleaned_block:
                    block_texts.append(cleaned_block)
        
        # Blokları çift yeni satırla (paragraf ayracı) birleştir
        return "\n\n".join(block_texts)

    def _clean_block_text(self, text: str) -> str:
        """
        Tek bir bloğu temizler.
        Bloğun içindeki tüm \n karakterlerini siler, çünkü bir blok genellikle tek bir cümledir.
        """
        if not text.strip():
            return ""

        # 1. Tire temizliği (De-hyphenation)
        # Satır sonundaki tireyi ve alt satırdaki kelimeyi birleştirir.
        # Örnek: "Geliştir-\nme" -> "Geliştirme"
        text = re.sub(r'(\w)-\s*\n\s*(\w)', r'\1\2', text)
        
        # 2. Satır Birleştirme (Line Merging)
        # Blok içindeki satır kırılımlarını boşluğa çevir.
        text = text.replace('\n', ' ')
        
        # 3. Fazla boşlukları temizle
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()

    def _is_header_footer(self, text: str) -> bool:
        text = text.strip()
        for pattern in self.header_footer_regex:
            if pattern.match(text):
                return True
        return False
        
    def _extract_text_with_ocr(self, page) -> str:
        if not self.use_ocr:
            return ""
        try:
            mat = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=mat)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            text = pytesseract.image_to_string(img, lang='eng+tur')
            return text
        except Exception as e:
            logger.warning(f"OCR failed: {str(e)}")
            return ""

    def _post_process_raw_text(self, text: str) -> str:
        """OCR çıktısı için temizlik"""
        text = re.sub(r'(\w)-\s*\n\s*(\w)', r'\1\2', text)
        text = text.replace('\n', ' ')
        text = re.sub(r'\s+', ' ', text)
        return text.strip()


# PDF Extractor instance
pdf_extractor = PDFTextExtractor(use_ocr=OCR_AVAILABLE)


# ============================================================
# PYDANTIC MODELLERİ
# ============================================================

class VectorRequest(BaseModel):
    text: str

class VectorResponse(BaseModel):
    vector: List[float]

class CrossEncodeRequest(BaseModel):
    sentence_a: str
    sentence_b: str

class CrossEncodeResponse(BaseModel):
    score: float

class BatchVectorRequest(BaseModel):
    texts: List[str]

class BatchVectorResponse(BaseModel):
    vectors: List[List[float]]

class PDFExtractResponse(BaseModel):
    text: str
    pages: List[str]
    page_count: int
    method: str
    success: bool
    error: Optional[str] = None


# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/")
async def root():
    return {
        "message": "Word Learning Python Service is running (v2.2)",
        "status": "healthy",
        "ocr_available": OCR_AVAILABLE,
        "version": "2.2.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "python-service",
        "ocr_available": OCR_AVAILABLE
    }

@app.post("/vectorize", response_model=VectorResponse)
async def vectorize(request: VectorRequest):
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        model = get_embedding_model()
        embedding = model.encode(request.text)
        return VectorResponse(vector=embedding.tolist())
    except Exception as e:
        logger.error(f"Vectorization error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/vectorize-batch", response_model=BatchVectorResponse)
async def vectorize_batch(request: BatchVectorRequest):
    try:
        if not request.texts:
            raise HTTPException(status_code=400, detail="Texts list cannot be empty")
        model = get_embedding_model()
        embeddings = model.encode(request.texts)
        return BatchVectorResponse(vectors=[emb.tolist() for emb in embeddings])
    except Exception as e:
        logger.error(f"Batch vectorization error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cross-encode", response_model=CrossEncodeResponse)
async def cross_encode(request: CrossEncodeRequest):
    try:
        if not request.sentence_a or not request.sentence_b:
            raise HTTPException(status_code=400, detail="Both sentences are required")
        model = get_cross_encoder_model()
        score = model.predict([(request.sentence_a, request.sentence_b)])
        normalized_score = 1 / (1 + np.exp(-score[0]))
        return CrossEncodeResponse(score=float(normalized_score))
    except Exception as e:
        logger.error(f"Cross-encoding error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-pdf", response_model=PDFExtractResponse)
async def extract_pdf_text(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        pdf_bytes = await file.read()
        if len(pdf_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty PDF file")
        
        logger.info(f"Extracting text from PDF: {file.filename} ({len(pdf_bytes)} bytes)")
        result = pdf_extractor.extract_text_from_pdf(pdf_bytes)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return PDFExtractResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-pdf-base64", response_model=PDFExtractResponse)
async def extract_pdf_from_base64(base64_data: str = Form(...)):
    try:
        import base64
        try:
            pdf_bytes = base64.b64decode(base64_data)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 data")
        if len(pdf_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty PDF data")
        
        result = pdf_extractor.extract_text_from_pdf(pdf_bytes)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        return PDFExtractResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Python service (v2.2 Block Reflow)...")
    logger.info(f"OCR Available: {OCR_AVAILABLE}")
    preload = os.getenv("PRELOAD_MODELS", "true").lower() == "true"
    if preload:
        logger.info("Preloading models...")
        try:
            get_embedding_model()
            get_cross_encoder_model()
            logger.info("All models preloaded successfully")
        except Exception as e:
            logger.warning(f"Model preloading failed: {e}")
    logger.info("Python service started successfully")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)