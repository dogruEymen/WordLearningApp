# Python Microservice Dockerfile
FROM python:3.11-slim

# Çalışma dizini
WORKDIR /app

# Sistem bağımlılıkları + Tesseract OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    # Tesseract OCR ve dil paketleri
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-tur \
    # PyMuPDF için
    libmupdf-dev \
    mupdf-tools \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıklarını kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY main.py .

# Model cache dizini
ENV TRANSFORMERS_CACHE=/app/models
ENV HF_HOME=/app/models
RUN mkdir -p /app/models

# Port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Uygulama başlat
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
