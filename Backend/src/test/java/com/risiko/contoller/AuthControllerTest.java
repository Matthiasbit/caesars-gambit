package com.risiko.contoller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.risiko.exception.AppException;
import com.risiko.exception.GlobalExceptionHandler;
import com.risiko.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Nested
    class Register {

        @Test
        void erfolgreich_gibt200Zurueck() throws Exception {
            when(authService.register("user", "test@example.com", "pw")).thenReturn("token123");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("username", "user", "email", "test@example.com", "password", "pw"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Registered successfully"));
        }

        @Test
        void emailBereitsVorhanden_gibt409Zurueck() throws Exception {
            when(authService.register(any(), any(), any()))
                    .thenThrow(new AppException(HttpStatus.CONFLICT, "Email exists"));

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("username", "user", "email", "test@example.com", "password", "pw"))))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.error").value("Email exists"));
        }

        @Test
        void erfolgreich_setztAccessTokenCookie() throws Exception {
            when(authService.register("user", "test@example.com", "pw")).thenReturn("token123");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("username", "user", "email", "test@example.com", "password", "pw"))))
                    .andExpect(header().string("Set-Cookie", containsString("accessToken=token123")));
        }
    }

    @Nested
    class Login {

        @Test
        void erfolgreich_gibt200Zurueck() throws Exception {
            when(authService.login("test@example.com", "pw")).thenReturn("token456");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("email", "test@example.com", "password", "pw"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Login successful"));
        }

        @Test
        void falscheCredentials_gibt401Zurueck() throws Exception {
            when(authService.login(any(), any()))
                    .thenThrow(new AppException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("email", "wrong@example.com", "password", "wrong"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Invalid credentials"));
        }

        @Test
        void erfolgreich_setztAccessTokenCookie() throws Exception {
            when(authService.login("test@example.com", "pw")).thenReturn("token456");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("email", "test@example.com", "password", "pw"))))
                    .andExpect(header().string("Set-Cookie", containsString("accessToken=token456")));
        }
    }

    @Nested
    class Signout {

        @Test
        void erfolgreich_gibt200Zurueck() throws Exception {
            mockMvc.perform(post("/api/auth/signout"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Signed out"));
        }

        @Test
        void erfolgreich_loeschtCookie() throws Exception {
            mockMvc.perform(post("/api/auth/signout"))
                    .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
        }
    }
}
