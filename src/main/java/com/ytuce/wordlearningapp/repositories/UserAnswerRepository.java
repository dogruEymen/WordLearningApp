package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    List<UserAnswer> findByQuestion_Quiz_WordList_User_UserId(long userId);
}
