package com.ytuce.wordlearningapp.services.quiz.responses;

import com.ytuce.wordlearningapp.services.question.responses.QuestionDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuizDto {
    private Long quizId;
    private List<QuestionDto> questions;
}
