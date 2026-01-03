package com.ytuce.wordlearningapp.services.meaning_extractor.responses;

import lombok.Data;

import java.util.List;

@Data
public class WordAnalysisResult {
    private String word;
    private String partOfSpeech;
    private String meaningEN;
    private String meaningTR;
    private List<String> synonyms;
    private String exampleSentence;
    private String exampleSentenceTR;
}
