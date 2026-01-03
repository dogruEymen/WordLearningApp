package com.ytuce.wordlearningapp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
public class QuizController {


    @GetMapping("/generate-quiz")
    public ResponseEntity<String> getProfile(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok("hi");
    }
}

