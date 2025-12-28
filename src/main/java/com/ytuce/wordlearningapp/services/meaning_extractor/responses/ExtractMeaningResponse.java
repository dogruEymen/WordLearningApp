package com.ytuce.wordlearningapp.services.meaning_extractor.responses;

import com.ytuce.wordlearningapp.models.WordWithMeaning;
import lombok.Data;

@Data
public class ExtractMeaningResponse {
    private WordWithMeaning wordWithMeaning;
}
