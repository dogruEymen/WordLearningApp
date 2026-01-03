package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
}
