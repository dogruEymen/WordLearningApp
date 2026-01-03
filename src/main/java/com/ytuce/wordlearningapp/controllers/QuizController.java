package com.ytuce.wordlearningapp.controllers;

import com.ytuce.wordlearningapp.services.quiz.QuizService;
import com.ytuce.wordlearningapp.services.quiz.requests.GenerateQuizRequest;
import com.ytuce.wordlearningapp.services.quiz.responses.QuizDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;


    @GetMapping("/generate-quiz")
    public ResponseEntity<QuizDto> generateQuiz(Authentication auth, GenerateQuizRequest req) {
        String email = auth.getName();
        return ResponseEntity.ok(quizService.generateQuiz(email, req));
    }
}

