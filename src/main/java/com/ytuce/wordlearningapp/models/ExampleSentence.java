package com.ytuce.wordlearningapp.models;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "example_sentence")
@NoArgsConstructor
@AllArgsConstructor
public class ExampleSentence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long exampleSentenceId;

    private String sentenceTr;
    private String sentenceEn;

    @OneToOne
    private WordWithMeaning wordWithMeaning;
}