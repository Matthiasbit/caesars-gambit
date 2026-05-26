package com.risiko.services;

import com.risiko.model.User;
import com.risiko.repository.UserRepository;
import com.risiko.security.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    class Register {

        @Test
        void emailBereitsVorhanden_wirftException() {
            when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register("user", "test@example.com", "pw"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Email exists");
        }

        @Test
        void usernameBereitsVorhanden_wirftException() {
            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(userRepository.existsByUsername("user")).thenReturn(true);

            assertThatThrownBy(() -> authService.register("user", "test@example.com", "pw"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Username exists");
        }

        @Test
        void erfolgreich_gibtTokenZurueck() {
            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(userRepository.existsByUsername("user")).thenReturn(false);
            when(passwordEncoder.encode("pw")).thenReturn("hashed");

            User saved = new User();
            saved.setId(1L);
            saved.setEmail("test@example.com");
            when(userRepository.save(any(User.class))).thenReturn(saved);
            when(jwtUtil.generateToken("test@example.com", 1L)).thenReturn("token123");

            String token = authService.register("user", "test@example.com", "pw");

            assertThat(token).isEqualTo("token123");
        }

        @Test
        void erfolgreich_speichertHashedPassword() {
            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(userRepository.existsByUsername("user")).thenReturn(false);
            when(passwordEncoder.encode("pw")).thenReturn("hashed");

            User saved = new User();
            saved.setId(1L);
            saved.setEmail("test@example.com");
            when(userRepository.save(any(User.class))).thenReturn(saved);
            when(jwtUtil.generateToken(any(), any())).thenReturn("token");

            authService.register("user", "test@example.com", "pw");

            verify(passwordEncoder).encode("pw");
            verify(userRepository).save(argThat(u -> "hashed".equals(u.getPassword())));
        }
    }

    @Nested
    class Login {

        @Test
        void emailNichtVorhanden_wirftException() {
            when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login("notfound@example.com", "pw"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Invalid credentials");
        }

        @Test
        void falschesPasswort_wirftException() {
            User u = new User();
            u.setPassword("hashed");
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(u));
            when(passwordEncoder.matches("wrongpw", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> authService.login("test@example.com", "wrongpw"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Invalid credentials");
        }

        @Test
        void richtigeCredentials_gibtTokenZurueck() {
            User u = new User();
            u.setId(1L);
            u.setEmail("test@example.com");
            u.setPassword("hashed");
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(u));
            when(passwordEncoder.matches("pw", "hashed")).thenReturn(true);
            when(jwtUtil.generateToken("test@example.com", 1L)).thenReturn("token123");

            String token = authService.login("test@example.com", "pw");

            assertThat(token).isEqualTo("token123");
        }
    }

    @Nested
    class GetUserFromAuth {

        @Test
        void keineAuthentication_wirftException() {
            SecurityContextHolder.clearContext();

            assertThatThrownBy(() -> authService.getUserFromAuth())
                    .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
        }

        @Test
        void anonymeAuthentication_wirftException() {
            AnonymousAuthenticationToken anonAuth = new AnonymousAuthenticationToken(
                    "key", "anonymous", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS")));
            SecurityContext ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(anonAuth);
            SecurityContextHolder.setContext(ctx);

            assertThatThrownBy(() -> authService.getUserFromAuth())
                    .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
        }

        @Test
        void authentifizierterUser_gibtUserZurueck() {
            Authentication auth = mock(Authentication.class);
            when(auth.isAuthenticated()).thenReturn(true);
            when(auth.getName()).thenReturn("test@example.com");
            SecurityContext ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);

            User u = new User();
            u.setEmail("test@example.com");
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(u));

            User result = authService.getUserFromAuth();

            assertThat(result.getEmail()).isEqualTo("test@example.com");
        }

        @Test
        void authentifizierterUser_nichtInDatenbank_wirftException() {
            Authentication auth = mock(Authentication.class);
            when(auth.isAuthenticated()).thenReturn(true);
            when(auth.getName()).thenReturn("ghost@example.com");
            SecurityContext ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);

            when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.getUserFromAuth())
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("User not found");
        }
    }
}
