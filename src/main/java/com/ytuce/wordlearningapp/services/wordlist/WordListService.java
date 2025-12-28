package com.ytuce.wordlearningapp.services.wordlist;

import com.ytuce.wordlearningapp.models.WordWithMeaning;
import com.ytuce.wordlearningapp.services.meaning_extractor.MeaningExtractorService;
import com.ytuce.wordlearningapp.services.meaning_extractor.requests.ExtractMeaningRequest;
import com.ytuce.wordlearningapp.services.wordlist.requests.AddWordRequest;
import com.ytuce.wordlearningapp.models.WordList;
import com.ytuce.wordlearningapp.repositories.WordListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WordListService {
    private final WordListRepository wordListRepository;
    private final MeaningExtractorService meaningExtractorService;

    public void addWord(long wordListId, AddWordRequest req) {

        if(!isAddWordRequestValid(req))
            return;

        var extractMeaningRequest = new ExtractMeaningRequest(req);

        var extractMeaningResponse = meaningExtractorService.extractMeaning(extractMeaningRequest);

        WordWithMeaning wordToAdd = extractMeaningResponse.getWordWithMeaning();

        WordList wordList = wordListRepository.findById(wordListId).orElseThrow();

        wordList.getWordWithMeaningList().add(wordToAdd);
    }

    private boolean isAddWordRequestValid(AddWordRequest req) {
        return false;
    }

}
