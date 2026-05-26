package com.risiko.contoller;

import com.risiko.model.User;
import com.risiko.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private AuthService authService;

    private UserController userController;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        userController = new UserController();
        ReflectionTestUtils.setField(userController, "authService", authService);
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    @Test
    void getCurrentUser_gibtUsernameZurueck() throws Exception {
        User user = new User();
        user.setUsername("testuser");
        when(authService.getUserFromAuth()).thenReturn(user);

        mockMvc.perform(get("/api/user/currentUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void nichtAuthentifiziert_gibt500Zurueck() throws Exception {
        when(authService.getUserFromAuth()).thenThrow(new RuntimeException("Authentication required"));

        Exception thrown = assertThrows(Exception.class, () ->
                mockMvc.perform(get("/api/user/currentUser")));

        assertThat(thrown.getCause()).isInstanceOf(RuntimeException.class)
                .hasMessage("Authentication required");
    }
}
