package com.ytuce.wordlearningapp.services.wordlist.responses;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WordWithMeaningDto {
    private Long id;
    private String partOfSpeech;

    private String wordWriting;

    private String meaningEn;
    private String meaningTr;

    private String exampleSentenceEn;
    private String exampleSentenceTr;
}