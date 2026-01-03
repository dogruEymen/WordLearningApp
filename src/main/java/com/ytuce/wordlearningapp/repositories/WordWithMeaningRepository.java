package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.WordWithMeaning;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordWithMeaningRepository extends JpaRepository<WordWithMeaning, Long> {
}
