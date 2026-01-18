package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
}
