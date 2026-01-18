package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.Meaning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MeaningRepository extends JpaRepository<Meaning, Long> {

    @Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "INSERT INTO meaning (description_en, description_tr, embedding) VALUES (?, ?, ?::vector)", nativeQuery = true)
    void saveNative(@Param("descEn") String descEn, @Param("descTr") String descTr, @Param("vectorStr") String vectorStr);

    @Query(value = """
        SELECT * FROM meaning 
        ORDER BY embedding <=> cast(:vectorString as vector) ASC 
        LIMIT :limit
        """, nativeQuery = true)
    List<Meaning> findClosestByVector(@Param("vectorString") String vectorString, @Param("limit") int limit);
}
