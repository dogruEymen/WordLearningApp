package com.ytuce.wordlearningapp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@Table(name = "word_with_meaning")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordWithMeaning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long wordWithMeaningId;

    private String partOfSpeech;

    @ManyToOne
    @JoinColumn(name = "word_id")
    private Word word;

    @OneToOne
    @JoinColumn(name = "example_sentence_id")
    private ExampleSentence exampleSentence;

    @ManyToOne
    @JoinColumn(name = "meaning_id")
    private Meaning meaning;
}