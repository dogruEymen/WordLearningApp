package com.ytuce.wordlearningapp.models.mappers;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

@Converter
public class VectorConverter implements AttributeConverter<List<Double>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<Double> attribute) {
        if (attribute == null) return null;
        try {
            // Converts Java List to JSON String: "[0.123, 0.456, ...]"
            // PostgreSQL parses this string automatically into the vector type
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException("Error converting vector to JSON String", e);
        }
    }

    @Override
    public List<Double> convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            // Reads the JSON String back into a Java List
            return objectMapper.readValue(dbData, List.class);
        } catch (Exception e) {
            throw new RuntimeException("Error reading vector from DB", e);
        }
    }
}
