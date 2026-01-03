package com.ytuce.wordlearningapp.repositories;

import com.ytuce.wordlearningapp.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.wordLists WHERE u.email = :email")
    Optional<User> findByEmailWithWordLists(@Param("email") String email);
}
