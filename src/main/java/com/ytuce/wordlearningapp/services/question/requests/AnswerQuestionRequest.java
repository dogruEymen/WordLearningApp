package com.ytuce.wordlearningapp.services.question.requests;

import lombok.Data;

import java.util.List;

@Data
public class AnswerQuestionRequest {
    private long answerId;
    private List<String> writing;
}
