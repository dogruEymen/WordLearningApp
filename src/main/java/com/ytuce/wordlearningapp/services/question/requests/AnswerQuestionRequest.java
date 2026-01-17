package com.ytuce.wordlearningapp.services.question.requests;

import lombok.Data;

import java.util.List;

@Data
public class AnswerQuestionRequest {
    private long questionId;
    private List<String> writing;
}
