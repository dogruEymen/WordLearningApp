package com.ytuce.wordlearningapp.controllers;

import com.ytuce.wordlearningapp.services.wordlist.requests.AddWordRequest;
import com.ytuce.wordlearningapp.services.wordlist.requests.CreateWordListRequest;
import com.ytuce.wordlearningapp.services.wordlist.WordListService;
import com.ytuce.wordlearningapp.services.wordlist.responses.WordListDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wordlist")
@RequiredArgsConstructor
public class WordListController {

    private final WordListService wordListService;

    @PostMapping("/{id}/add-word")
    public void addWord(@PathVariable long id, @RequestBody AddWordRequest req, Authentication auth) {
        wordListService.addWord(id, req, auth.getName());
    }

    @PostMapping("/create")
    public void create(@RequestBody CreateWordListRequest req, Authentication auth) {
        wordListService.createWordList(req, auth.getName());
    }

    @GetMapping("/get-mine")
    public List<WordListDto> getUserWordLists(Authentication auth) {
        return wordListService.getUserWordLists(auth.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWordList(@PathVariable long id, Authentication auth) {
        wordListService.deleteWordList(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{listId}/word/{wordId}")
    public ResponseEntity<Void> removeWordFromList(
            @PathVariable long listId,
            @PathVariable long wordId,
            Authentication auth) {
        wordListService.removeWordFromList(listId, wordId, auth.getName());
        return ResponseEntity.noContent().build();
    }

}
