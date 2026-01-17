package com.ytuce.wordlearningapp.services.question.responses;

import com.ytuce.wordlearningapp.models.*;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
public class QuestionDto {
    private Long questionId;
    private String questionSentence;
    private QuestionType questionType;
    private List<OptionDto> options;
}
