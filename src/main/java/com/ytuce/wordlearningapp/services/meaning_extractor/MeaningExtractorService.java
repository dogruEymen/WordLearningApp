package com.ytuce.wordlearningapp.services.meaning_extractor;

import com.ytuce.wordlearningapp.models.ExampleSentence;
import com.ytuce.wordlearningapp.models.Meaning;
import com.ytuce.wordlearningapp.models.Word;
import com.ytuce.wordlearningapp.models.WordWithMeaning;
import com.ytuce.wordlearningapp.repositories.*;
import com.ytuce.wordlearningapp.services.meaning_extractor.requests.ExtractMeaningRequest;
import com.ytuce.wordlearningapp.services.meaning_extractor.requests.TextGenerationRequest;
import com.ytuce.wordlearningapp.services.meaning_extractor.requests.VectorRequest;
import com.ytuce.wordlearningapp.services.meaning_extractor.responses.SynonymDto;
import com.ytuce.wordlearningapp.services.meaning_extractor.responses.TextGenerationResponse;
import com.ytuce.wordlearningapp.services.meaning_extractor.responses.WordAnalysisResult;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;

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

    private static final int MAX_RECURSION_DEPTH = 2;

    //@Transactional
    public WordWithMeaning extractMeaning(ExtractMeaningRequest req) {
        return extractMeaningRecursive(req, 0);
    }

    @Async
    private WordWithMeaning extractMeaningRecursive(ExtractMeaningRequest req, int currentDepth) {
        try {
            WordAnalysisResult analysisResult = analyzeWord(req);
            if (analysisResult == null) return null;

            String combinedText = analysisResult.getWord() + " : " + analysisResult.getMeaningEN();
            String vectorString = getVectorEmbedding(combinedText);

            List<Meaning> candidates = meaningRepository.findClosestByVector(vectorString, 5);

            Word word = Word.builder()
                    .writing(analysisResult.getWord())
                    .build();

            Meaning meaning = Meaning.builder()
                    .descriptionEn(analysisResult.getMeaningEN())
                    .descriptionTr(analysisResult.getMeaningTR())
                    .embedding(vectorString)
                    .build();

            boolean isMeaningFound = false;

            for (Meaning candidate : candidates) {
                if (isSynonym(combinedText, candidate.getDescriptionEn())) {
                    isMeaningFound = true;
                    meaning = candidate;
                    break;
                }
            }


            Optional<Word> foundWord = wordRepository.findOneByWriting(analysisResult.getWord());

            word = foundWord.orElse(word);

            var isWordFound = foundWord.isPresent();

            if(isMeaningFound && isWordFound)
            {
                var wordWithMeaning = wordWithMeaningRepository.findByWord_WordIdAndMeaning_MeaningId(foundWord.get().getWordId(), meaning.getMeaningId());

                if(wordWithMeaning.isPresent() && wordWithMeaning.get().getPartOfSpeech() == analysisResult.getPartOfSpeech())
                {
                    return wordWithMeaning.get();
                }
            }

            if (!isMeaningFound) {
                meaning = meaningRepository.save(meaning);
            }

            if (!isWordFound) {
                word = wordRepository.save(word);
            }

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

            if (currentDepth < MAX_RECURSION_DEPTH && analysisResult.getSynonyms() != null) {
                for (var synonymData : analysisResult.getSynonyms()) {
                    processSynonym(synonymData, currentDepth);
                }
            }

            return wordWithMeaning;

        } catch (HttpClientErrorException.UnprocessableEntity e) {
            System.out.println("Python Validation Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private void processSynonym(SynonymDto synonymData, int currentDepth) {
        try {
            String synonymWord = synonymData.getWord();
            String sentence = synonymData.getExampleSentence();

            int startIndex = sentence.toLowerCase().indexOf(synonymWord.toLowerCase());

            if (startIndex == -1) {
                return;
            }

            ExtractMeaningRequest synonymRequest = new ExtractMeaningRequest(sentence, startIndex, synonymWord.length());

            extractMeaningRecursive(synonymRequest, currentDepth + 1);

        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    private String getVectorEmbedding(String text) {
        VectorRequest reqBody = new VectorRequest();
        reqBody.setText(text);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<VectorRequest> request = new HttpEntity<>(reqBody, headers);

        ResponseEntity<VectorResponse> vectorResponse = restTemplate.postForEntity(
                "http://localhost:8000/vectorize",
                request,
                VectorResponse.class
        );
        return vectorResponse.getBody().vector().toString();
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
        return response.getBody().score() >= 0.65;
    }

    private WordAnalysisResult analyzeWord(ExtractMeaningRequest req) {
        String prompt = generateAnalysisPrompt(req);
        return sendPromptToLLM(prompt);
    }

    private String generateAnalysisPrompt(ExtractMeaningRequest req) {
        return """
            ### SYSTEM INSTRUCTION
            You are an expert lexicographer and translator.
            Your task is to analyze a specific word within a given sentence context.
            
            ### OUTPUT FORMAT
            Return raw JSON only. Do not use Markdown formatting (no ```json code blocks). 
            Do not include any conversational text.
            
            The JSON must follow this exact schema:
            {
              "word": "The lemma (base form) of the target word (e.g., 'running' -> 'run')",
              "partOfSpeech": "The Part of Speech (noun, verb, adjective, etc.) in this specific context",
              "meaningEN": "A concise English definition fitting this specific context",
              "meaningTR": "The Turkish translation of the word in this specific context",
              "synonyms": [
                { "word": "synonym1", "exampleSentence": "A new sentence using synonym1" },
                { "word": "synonym2", "exampleSentence": "A new sentence using synonym2" }
              ],
              "exampleSentence": "A new example sentence (English) using the target word in the same context",
              "exampleSentenceTR": "Turkish translation of the exampleSentence"
            }
            
            ### ONE-SHOT EXAMPLE
            Input Sentence: "The bank of the river was muddy after the rain."
            Target Word: "bank"
            Output:
            {
              "word": "bank",
              "partOfSpeech": "noun",
              "meaningEN": "The land alongside or sloping down to a river or lake",
              "meaningTR": "Nehir kıyısı",
              "synonyms": [
                { "word": "shore", "exampleSentence": "We walked along the shore." },
                { "word": "edge", "exampleSentence": "He stood at the water's edge." }
              ],
              "exampleSentence": "They sat on the grassy bank watching the water flow.",
              "exampleSentenceTR": "Suyun akışını izleyerek çimle kaplı kıyıda oturdular."
            }
            
            ### USER INPUT
            Input Sentence: "%s"
            Target Word: "%s"
            
            ### RESPONSE
            """.formatted(
                    req.getSentence(),
                req.getSentence().substring(req.getWordStartIndex(), req.getWordStartIndex()+req.getWordLength())
        );
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
