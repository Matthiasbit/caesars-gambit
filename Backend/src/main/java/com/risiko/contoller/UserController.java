package com.risiko.contoller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.risiko.model.User;
import com.risiko.model.dto.UserDto;
import com.risiko.services.AuthService;

@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @Autowired
    private AuthService authService;

    @GetMapping("/currentUser")
    public ResponseEntity<UserDto> getCurrentUser() {
        User user = authService.getUserFromAuth();
        return ResponseEntity.ok(new UserDto(user.getUsername()));
    }
}
