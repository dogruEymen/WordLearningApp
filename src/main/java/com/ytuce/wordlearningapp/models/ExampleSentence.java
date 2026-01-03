package com.ytuce.wordlearningapp.models;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "example_sentence")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExampleSentence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long exampleSentenceId;

    private String sentenceTr;
    private String sentenceEn;

    @OneToOne(mappedBy = "exampleSentence")
    private WordWithMeaning wordWithMeaning;
}