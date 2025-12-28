package com.ytuce.wordlearningapp.controllers;

import com.ytuce.wordlearningapp.services.user.responses.UserProfileResponse;
import com.ytuce.wordlearningapp.services.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(userService.getProfile(email));
    }
}

