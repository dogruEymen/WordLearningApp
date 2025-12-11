package com.ytuce.wordlearningapp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Table(name = "question")
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionId;

    private String questionType;
    private String questionSentence;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @OneToMany(mappedBy = "question")
    private List<Answer> correctAnswers;

    @OneToMany(mappedBy = "question")
    private List<Answer> userAnswers;

    @ManyToMany
    @JoinTable(
            name = "question_word_meanings",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "word_with_meaning_id")
    )
    private List<WordWithMeaning> options;
}