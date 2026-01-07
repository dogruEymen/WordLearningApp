package com.ytuce.wordlearningapp.services.meaning_extractor.requests;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TextGenerationRequest {
    private String model;
    private String prompt;
    private boolean stream;
}
