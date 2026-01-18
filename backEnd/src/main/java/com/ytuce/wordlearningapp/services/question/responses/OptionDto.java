package com.ytuce.wordlearningapp.services.question.responses;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OptionDto {
    private String writing;
    private String meaningTr;  // Fill-blank soruları için hint olarak kullanılır
    private String meaningEn;  // Opsiyonel: İngilizce tanım
}
