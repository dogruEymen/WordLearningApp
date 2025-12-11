package com.ytuce.wordlearningapp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Table(name = "meaning")
@NoArgsConstructor
@AllArgsConstructor
public class Meaning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long meaningId;

    @OneToMany(mappedBy = "meaning")
    private List<WordWithMeaning> wordMeanings;

    private String descriptionEn;
    private String descriptionTr;
}