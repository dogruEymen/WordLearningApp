package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.Word;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WordRepository extends JpaRepository<Word, Long> {
    Optional<Word> findOneByWriting(String writing);
    List<Word> findAllByWritingIn(List<String> writings);
}
