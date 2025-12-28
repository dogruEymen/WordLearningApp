package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.User;
import com.ytuce.wordlearningapp.models.WordList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WordListRepository extends JpaRepository<WordList, Long> {
}
