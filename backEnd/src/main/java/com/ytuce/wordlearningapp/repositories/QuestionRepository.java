package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}
