package com.ytuce.wordlearningapp.services.meaning_extractor;

import com.ytuce.wordlearningapp.models.ExampleSentence;
import com.ytuce.wordlearningapp.models.Meaning;
import com.ytuce.wordlearningapp.models.Word;
import com.ytuce.wordlearningapp.models.WordWithMeaning;
import com.ytuce.wordlearningapp.repositories.*;
import com.ytuce.wordlearningapp.services.meaning_extractor.requests.ExtractMeaningRequest;
import com.ytuce.wordlearningapp.services.meaning_extractor.requests.TextGenerationRequest;
import com.ytuce.wordlearningapp.services.meaning_extractor.requests.VectorRequest;
import com.ytuce.wordlearningapp.services.meaning_extractor.responses.TextGenerationResponse;
import com.ytuce.wordlearningapp.services.meaning_extractor.responses.WordAnalysisResult;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

record VectorResponse(List<Double> vector) {}
record CrossEncodeRequest(String sentence_a, String sentence_b) {}
record CrossEncodeResponse(Double score) {}

@Service
@RequiredArgsConstructor
public class MeaningExtractorService {

    private final WordRepository wordRepository;
    private final MeaningRepository meaningRepository;
    private final WordWithMeaningRepository wordWithMeaningRepository;
    private final ExampleSentenceRepository exampleSentenceRepository;
    private RestTemplate restTemplate = new RestTemplate();
    private ObjectMapper objectMapper = new ObjectMapper();

    private final float treshold = 0.5f;

    @Transactional
    public WordWithMeaning extractMeaning(ExtractMeaningRequest req) {
        try {
            // TODO: Burada servis LLM kullanarak gelen girdiden ilgili analizleri yapacak ve **VERİTABANINA YAZACAK**

            WordAnalysisResult analysisResult = analyzeWord(req);


            Word word = Word.builder()
                    .writing(analysisResult.getWord())
                    .build();

            word = wordRepository.save(word);

            String combinedText = analysisResult.getWord() + " : " + analysisResult.getMeaningEN();
            VectorRequest reqBody = new VectorRequest();

            reqBody.setText(combinedText);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<VectorRequest> request = new HttpEntity<>(reqBody, headers);

            ResponseEntity<VectorResponse> vectorResponse = restTemplate.postForEntity(
                    "http://localhost:8000/vectorize",
                    request,
                    VectorResponse.class
            );


           String vectorString = vectorResponse.getBody().vector().toString();

            List<Meaning> candidates = meaningRepository.findClosestByVector(vectorString, 5);


            Meaning meaning = Meaning.builder()
                    .descriptionEn(analysisResult.getWord() + " : " + analysisResult.getMeaningEN())
                    .descriptionTr(analysisResult.getMeaningTR())
                    .build();


            for (Meaning candidate : candidates) {
                if (isSynonym(analysisResult.getWord() + " : " + analysisResult.getMeaningEN(),
                        candidate.getDescriptionEn())) {

                    meaning = candidate;
                    break;
                }
            }

            meaning = meaningRepository.save(meaning);

            ExampleSentence exampleSentence = ExampleSentence.builder()
                    .sentenceTr(analysisResult.getExampleSentenceTR())
                    .sentenceEn(analysisResult.getExampleSentence())
                    .build();

            exampleSentence = exampleSentenceRepository.save(exampleSentence);

            WordWithMeaning wordWithMeaning = WordWithMeaning.builder()
                    .meaning(meaning)
                    .word(word)
                    .exampleSentence(exampleSentence)
                    .partOfSpeech(analysisResult.getPartOfSpeech())
                    .build();

            wordWithMeaning = wordWithMeaningRepository.save(wordWithMeaning);

            return wordWithMeaning;
        }catch (HttpClientErrorException.UnprocessableEntity e) {
            // This prints: "value_error.missing", "loc": ["body", "word"]
            System.out.println("Python Validation Error: " + e.getResponseBodyAsString());
        }

        return null;
    }

    private boolean isSynonym(String newDesc, String candidateDesc) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);


        HttpEntity<CrossEncodeRequest> request = new HttpEntity<>(new CrossEncodeRequest(newDesc, candidateDesc), headers);

        ResponseEntity<CrossEncodeResponse> response = restTemplate.postForEntity(
                "http://localhost:8000/cross-encode",
                request,
                CrossEncodeResponse.class
        );

        // Threshold of 0.65 (Same as our Python tests)
        return response.getBody().score() >= 0.65;
    }

    private WordAnalysisResult analyzeWord(ExtractMeaningRequest req) {

        String prompt = generateAnalysisPrompt(req);

        WordAnalysisResult llmResponse = sendPromptToLLM(prompt);

        return llmResponse;
    }

    private String generateAnalysisPrompt(ExtractMeaningRequest req) {

        return """
                You are a word analyzer. You are expert at finding synonyms of the words.
                Your inputs and outputs are #JSON ONLY# and structure is as following:
               \s
                INPUT:
                {
                "sentence": "She claimed that the dog attacked her.",
                "word": "claim"
                }
               \s
                OUTPUT:
                {
                "word": "Claim",
                "partOfSpeech": "POS OF THE WORD",
                "meaningEN": "ENGLISH MEANING OF THE WORD",
                "meaningTR": "TURKISH MEANING OF THE WORD",
                "synonyms": ["A WORD WITH SAME MEANING", ...]
                "exampleSentence": "AN EXAMPLE SENTENCE USING THE WORD WITH THE SAME POS AND MEANING",
                "exampleSentenceTR": "TURKISH TRANSLATION OF THE GENERATED SENTENCE"
                }
               \s
               \s
                ANALYZE THE FOLLOWING INPUT:
               \s
                INPUT:
                {
                "sentence": "\s""" + req.getSentence() + """ 
                ",
                "word": "\s""" + req.getSentence().substring(req.getWordStartIndex(), req.getWordStartIndex()+req.getWordLength()) + """
                "
                }
                
                OUTPUT:
                
                """;
    }

    private WordAnalysisResult sendPromptToLLM(String prompt) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        TextGenerationRequest reqBody = new TextGenerationRequest(
                "llama3.1:8b",
                prompt,
                false
        );

        HttpEntity<TextGenerationRequest> request = new HttpEntity<>(reqBody, headers);

        ResponseEntity<TextGenerationResponse> response = restTemplate.postForEntity(
                "http://localhost:11434/api/generate",
                request,
                TextGenerationResponse.class);

        WordAnalysisResult result = parseLLMResponse(response.getBody().getResponse());

        return result;

    }

    private WordAnalysisResult parseLLMResponse(String llmResponse) {
        try {
            return objectMapper.readValue(llmResponse, WordAnalysisResult.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }


}
