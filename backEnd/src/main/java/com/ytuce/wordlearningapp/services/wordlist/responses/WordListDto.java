package com.ytuce.wordlearningapp.services.wordlist.responses;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class WordListDto {
    private Long wordListId;
    private String name;
    private List<WordWithMeaningDto> words;
}