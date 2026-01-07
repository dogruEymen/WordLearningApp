package com.ytuce.wordlearningapp.models;

import com.ytuce.wordlearningapp.models.mappers.VectorConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnTransformer;

import java.util.List;

@Entity
@Data
@Table(name = "meaning")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meaning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long meaningId;

    @OneToMany(mappedBy = "meaning")
    private List<WordWithMeaning> wordMeanings;

    @Column(columnDefinition = "vector")
    // This magic line tells Postgres: "Take this string input (?) and cast it to a vector"
    @ColumnTransformer(write = "?::vector")
    private String embedding;

    private String descriptionEn;
    private String descriptionTr;
}