package com.ytuce.wordlearningapp.services.meaning_extractor.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class VectorRequest {
    @JsonProperty("text")
    private String text;
}
