package com.ytuce.wordlearningapp.services.auth;

import com.ytuce.wordlearningapp.services.auth.requests.LoginRequest;
import com.ytuce.wordlearningapp.services.auth.requests.RegisterRequest;
import com.ytuce.wordlearningapp.services.auth.responses.AuthResponse;
import com.ytuce.wordlearningapp.models.User;
import com.ytuce.wordlearningapp.repositories.UserRepository;
import com.ytuce.wordlearningapp.services.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final BCryptPasswordEncoder encoder;
    private final JwtService jwt;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.findByEmail(req.getEmail()).isPresent())
            throw new RuntimeException("Email already exists");

        User user = User.builder()
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .name(req.getName())
                .build();

        userRepo.save(user);

        String token = jwt.generate(user);
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Not found"));

        if (!encoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Wrong password");

        String token = jwt.generate(user);
        return new AuthResponse(token);
    }
}
