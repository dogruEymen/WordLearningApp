package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.ExampleSentence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExampleSentenceRepository extends JpaRepository<ExampleSentence, Long> {

}

