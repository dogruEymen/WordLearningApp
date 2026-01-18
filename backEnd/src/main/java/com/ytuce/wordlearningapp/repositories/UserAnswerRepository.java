package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.Quiz;
import com.ytuce.wordlearningapp.models.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
}
