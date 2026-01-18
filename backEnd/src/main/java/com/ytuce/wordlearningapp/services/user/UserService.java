package com.ytuce.wordlearningapp.services.user;

import com.ytuce.wordlearningapp.services.user.responses.UserProfileResponse;
import com.ytuce.wordlearningapp.models.User;
import com.ytuce.wordlearningapp.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserProfileResponse(
                user.getEmail(),
                user.getName()
        );
    }
}
