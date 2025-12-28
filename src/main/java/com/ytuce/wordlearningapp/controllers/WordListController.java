package com.ytuce.wordlearningapp.controllers;

import com.ytuce.wordlearningapp.services.wordlist.requests.AddWordRequest;
import com.ytuce.wordlearningapp.services.wordlist.requests.CreateWordListRequest;
import com.ytuce.wordlearningapp.services.wordlist.WordListService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wordlists")
@RequiredArgsConstructor
public class WordListController {

    private final WordListService wordListService;

    @PostMapping("/{id}/add-word")
    public void register(@PathVariable long wordListId, @RequestBody AddWordRequest req) {
        wordListService.addWord(wordListId, req);
    }

    @PostMapping("/create")
    public void login(@RequestBody CreateWordListRequest req) {

    }

}
