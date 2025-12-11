package com.ytuce.wordlearningapp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Table(name = "word_list")
@NoArgsConstructor
@AllArgsConstructor
public class WordList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long wordListId;

    private String name;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany
    @JoinTable(
            name = "word_list_word_meanings",
            joinColumns = @JoinColumn(name = "word_list_id"),
            inverseJoinColumns = @JoinColumn(name = "word_with_meaning_id")
    )
    private List<WordWithMeaning> wordWithMeaningList;

    @OneToMany(mappedBy = "wordList")
    private List<Quiz> quizzes;
}
