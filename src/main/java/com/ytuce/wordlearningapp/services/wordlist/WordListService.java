package com.ytuce.wordlearningapp.services.wordlist;

import com.ytuce.wordlearningapp.models.User;
import com.ytuce.wordlearningapp.models.WordList;
import com.ytuce.wordlearningapp.models.WordWithMeaning;
import com.ytuce.wordlearningapp.repositories.UserRepository;
import com.ytuce.wordlearningapp.repositories.WordListRepository;
import com.ytuce.wordlearningapp.services.meaning_extractor.MeaningExtractorService;
import com.ytuce.wordlearningapp.services.meaning_extractor.requests.ExtractMeaningRequest;
import com.ytuce.wordlearningapp.services.wordlist.requests.AddWordRequest;
import com.ytuce.wordlearningapp.services.wordlist.requests.CreateWordListRequest;
import com.ytuce.wordlearningapp.services.wordlist.responses.WordListDto;
import com.ytuce.wordlearningapp.services.wordlist.responses.WordWithMeaningDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WordListService {
    private final WordListRepository wordListRepository;
    private final MeaningExtractorService meaningExtractorService;
    private final UserRepository userRepository;

    @Transactional
    public void addWord(long wordListId, AddWordRequest req, String userEmail) {

        if(!isAddWordRequestValid(req))
            return;

        var extractMeaningRequest = new ExtractMeaningRequest(req);

        WordWithMeaning wordToAdd = meaningExtractorService.extractMeaning(extractMeaningRequest);

        WordList wordList = wordListRepository.findById(wordListId).orElseThrow();

        if(wordList.getWordWithMeaningList().contains(wordToAdd))
        {
            return;
        }

        wordList.getWordWithMeaningList().add(wordToAdd);

        User user = userRepository.findByEmail(userEmail).orElseThrow();

        wordList.setUser(user);
    }

    @Transactional
    public void createWordList(CreateWordListRequest req, String userEmail) {
        if(!isCreateWordListRequestValid(req))
            return;

        User user = userRepository.findByEmail(userEmail).orElseThrow();

        var wordList = WordList.builder()
                .name(req.getName())
                .user(user)
                .build();

        wordListRepository.save(wordList);
    }

    @Transactional
    public List<WordListDto> getUserWordLists(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();

        return user.getWordLists().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private WordListDto convertToDTO(WordList wordList) {
        List<WordWithMeaningDto> wordDTOs = wordList.getWordWithMeaningList().stream()
                .map(wwm -> WordWithMeaningDto.builder()
                        .id(wwm.getWordWithMeaningId())
                        .partOfSpeech(wwm.getPartOfSpeech())
                        .wordWriting(wwm.getWord() != null ? wwm.getWord().getWriting() : null)
                        .meaningEn(wwm.getMeaning() != null ? wwm.getMeaning().getDescriptionEn() : null)
                        .meaningTr(wwm.getMeaning() != null ? wwm.getMeaning().getDescriptionTr() : null)
                        .exampleSentenceEn(wwm.getExampleSentence() != null ? wwm.getExampleSentence().getSentenceEn() : null)
                        .exampleSentenceTr(wwm.getExampleSentence() != null ? wwm.getExampleSentence().getSentenceTr() : null)
                        .build())
                .collect(Collectors.toList());

        return WordListDto.builder()
                .wordListId(wordList.getWordListId())
                .name(wordList.getName())
                .words(wordDTOs)
                .build();
    }

    private boolean isAddWordRequestValid(AddWordRequest req) {
        return true;
    }

    private boolean isCreateWordListRequestValid(CreateWordListRequest req) {
        return true;
    }




}
