package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.Meaning;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeaningRepository extends JpaRepository<Meaning, Long> {
}
