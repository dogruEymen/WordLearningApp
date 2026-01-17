package com.ytuce.wordlearningapp.services.meaning_extractor.requests;

import com.ytuce.wordlearningapp.services.wordlist.requests.AddWordRequest;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExtractMeaningRequest {
    private String sentence;
    private int wordStartIndex;
    private int wordLength;

    public ExtractMeaningRequest(AddWordRequest req) {
        sentence = req.getSentence();
        wordStartIndex = req.getWordStartIndex();
        wordLength = req.getWordLength();
    }
}
