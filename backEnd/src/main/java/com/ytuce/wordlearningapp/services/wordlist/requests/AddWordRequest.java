package com.ytuce.wordlearningapp.services.wordlist.requests;

import lombok.Data;

@Data
public class AddWordRequest {
    private String sentence;
    private int wordStartIndex;
    private int wordLength;
}
