package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.WordWithMeaning;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WordWithMeaningRepository extends JpaRepository<WordWithMeaning, Long> {
    Optional<WordWithMeaning> findByWord_WordIdAndMeaning_MeaningId(Long wordId, Long meaningId);
}
