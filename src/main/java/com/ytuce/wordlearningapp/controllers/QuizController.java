package com.ytuce.wordlearningapp.controllers;

import com.ytuce.wordlearningapp.services.question.QuestionService;
import com.ytuce.wordlearningapp.services.question.requests.AnswerQuestionRequest;
import com.ytuce.wordlearningapp.services.quiz.QuizService;
import com.ytuce.wordlearningapp.services.quiz.requests.GenerateQuizRequest;
import com.ytuce.wordlearningapp.services.quiz.responses.QuizDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;
    private final QuestionService questionService;

    @PostMapping("/generate-quiz")
    public ResponseEntity<QuizDto> generateQuiz(@RequestBody GenerateQuizRequest req, Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(quizService.generateQuiz(email, req));
    }

    @PostMapping("/answer-question")
    public ResponseEntity<Boolean> generateQuiz(@RequestBody AnswerQuestionRequest req, Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(questionService.answerQuestion(email, req));
    }
}