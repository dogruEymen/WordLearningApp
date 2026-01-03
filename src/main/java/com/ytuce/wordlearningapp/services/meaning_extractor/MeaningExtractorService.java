package com.ytuce.wordlearningapp.services.meaning_extractor;

import com.ytuce.wordlearningapp.models.ExampleSentence;
import com.ytuce.wordlearningapp.models.Meaning;
import com.ytuce.wordlearningapp.models.Word;
import com.ytuce.wordlearningapp.models.WordWithMeaning;
import com.ytuce.wordlearningapp.repositories.*;
import com.ytuce.wordlearningapp.services.meaning_extractor.requests.ExtractMeaningRequest;
import com.ytuce.wordlearningapp.services.meaning_extractor.responses.WordAnalysisResult;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeaningExtractorService {

    private final WordRepository wordRepository;
    private final MeaningRepository meaningRepository;
    private final WordWithMeaningRepository wordWithMeaningRepository;
    private final ExampleSentenceRepository exampleSentenceRepository;
    private final WordListRepository wordListRepository;

    @Transactional
    public WordWithMeaning extractMeaning(ExtractMeaningRequest req) {
        // TODO: Burada servis LLM kullanarak gelen girdiden ilgili analizleri yapacak ve **VERİTABANINA YAZACAK**

        WordAnalysisResult analysisResult = analyzeWord(req);


        Word word = Word.builder()
                .writing(analysisResult.getWord())
                .build();

        word = wordRepository.save(word);

        Meaning meaning = Meaning.builder()
                .descriptionEn(analysisResult.getMeaningEN())
                .descriptionTr(analysisResult.getMeaningTR())
                .build();

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
    }

    private WordAnalysisResult analyzeWord(ExtractMeaningRequest req) {

        String prompt = generateAnalysisPrompt(req);

        String llmResponse = sendPromptToLLM(prompt);

        WordAnalysisResult result = parseLLMResponse(llmResponse);

        return result;
    }

    private String generateAnalysisPrompt(ExtractMeaningRequest req) {

        return """
                You are a word analyzer. You are expert at finding synonyms of the words.
                Your input and output structure is as following:
                
                INPUT:
                {
                "sentence": "She claimed that the dog attacked her.",
                "word": "claim"
                }
                
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
                
                
                ANALYZE THE FOLLOWING INPUT:
                
                INPUT:
                {
                "sentence": "To succeed in this industry, one must be disciplined yet also possess an innate level of creativity.",
                "word": "creativity"
                }
                
                OUTPUT:
                
                """;
    }

    private String sendPromptToLLM(String prompt) {
        // TODO: send the prompt to the llm

        return """
                {
                    "word": "Creativity",
                    "partOfSpeech": "Noun",
                    "meaningEN": "The use of imagination or original ideas to create something; inventiveness.",
                    "meaningTR": "Yaratıcılık, üretkenlik.",
                    "synonyms": [
                        "inventiveness",
                        "imagination",
                        "originality",
                        "innovation",
                        "artistry",
                        "resourcefulness",
                        "vision"
                    ],
                    "exampleSentence": "The marketing team's creativity led to a campaign that tripled the company's sales.",
                    "exampleSentenceTR": "Pazarlama ekibinin yaratıcılığı, şirketin satışlarını üç katına çıkaran bir kampanyaya yol açtı."
                }
                """;
    }

    private WordAnalysisResult parseLLMResponse(String llmResponse) {
        var result = new WordAnalysisResult();
        result.setWord("Creativity");
        result.setMeaningEN("The use of imagination or original ideas to create something; inventiveness.");
        result.setMeaningTR("Yaratıcılık, üretkenlik.");
        List<String> synonyms = List.of(
                "inventiveness",
                "imagination",
                "originality",
                "innovation",
                "artistry",
                "resourcefulness",
                "vision"
                );

        result.setSynonyms(synonyms);
        result.setExampleSentence("The marketing team's creativity led to a campaign that tripled the company's sales.");
        result.setExampleSentenceTR("Pazarlama ekibinin yaratıcılığı, şirketin satışlarını üç katına çıkaran bir kampanyaya yol açtı.");
        result.setPartOfSpeech("Noun");
        return result;
    }
}
