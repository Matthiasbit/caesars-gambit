package com.risiko.security;

import com.risiko.model.User;
import com.risiko.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    class OhneToken {

        @Test
        void keinHeaderKeineCookies_setzt_keineAuthentication() throws Exception {
            when(request.getHeader("Authorization")).thenReturn(null);
            when(request.getCookies()).thenReturn(null);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        void headerOhneBearerPrefix_setzt_keineAuthentication() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");
            when(request.getCookies()).thenReturn(null);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        void cookiesOhneAccessToken_setzt_keineAuthentication() throws Exception {
            when(request.getHeader("Authorization")).thenReturn(null);
            Cookie other = new Cookie("sessionId", "abc123");
            when(request.getCookies()).thenReturn(new Cookie[]{other});

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }
    }

    @Nested
    class MitBearerHeader {

        @Test
        void gueltigerToken_setztAuthentication() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer valid.token.here");
            when(jwtUtil.validateToken("valid.token.here")).thenReturn(true);
            when(jwtUtil.getEmailFromToken("valid.token.here")).thenReturn("user@example.com");
            User user = new User();
            user.setEmail("user@example.com");
            user.setPassword("hashed_pw");
            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
            assertThat(SecurityContextHolder.getContext().getAuthentication().getName())
                    .isEqualTo("user@example.com");
        }

        @Test
        void ungueltigerToken_setzt_keineAuthentication() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer bad.token");
            when(jwtUtil.validateToken("bad.token")).thenReturn(false);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        void gueltigerTokenAberUserNichtGefunden_wirftUsernameNotFoundException() {
            when(request.getHeader("Authorization")).thenReturn("Bearer valid.token.here");
            when(jwtUtil.validateToken("valid.token.here")).thenReturn(true);
            when(jwtUtil.getEmailFromToken("valid.token.here")).thenReturn("ghost@example.com");
            when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> filter.doFilterInternal(request, response, filterChain))
                    .isInstanceOf(UsernameNotFoundException.class)
                    .hasMessage("User not found");
        }
    }

    @Nested
    class MitCookie {

        @Test
        void accessTokenCookie_gueltig_setztAuthentication() throws Exception {
            when(request.getHeader("Authorization")).thenReturn(null);
            Cookie accessToken = new Cookie("accessToken", "cookie.token.here");
            when(request.getCookies()).thenReturn(new Cookie[]{accessToken});
            when(jwtUtil.validateToken("cookie.token.here")).thenReturn(true);
            when(jwtUtil.getEmailFromToken("cookie.token.here")).thenReturn("user@example.com");
            User user = new User();
            user.setEmail("user@example.com");
            user.setPassword("hashed_pw");
            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        }

        @Test
        void accessTokenCookieUngueltig_setzt_keineAuthentication() throws Exception {
            when(request.getHeader("Authorization")).thenReturn(null);
            Cookie accessToken = new Cookie("accessToken", "invalid.cookie.token");
            when(request.getCookies()).thenReturn(new Cookie[]{accessToken});
            when(jwtUtil.validateToken("invalid.cookie.token")).thenReturn(false);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        void mehrereCoookies_accessTokenWirdGefunden() throws Exception {
            when(request.getHeader("Authorization")).thenReturn(null);
            Cookie other = new Cookie("other", "val");
            Cookie accessToken = new Cookie("accessToken", "cookie.token.here");
            when(request.getCookies()).thenReturn(new Cookie[]{other, accessToken});
            when(jwtUtil.validateToken("cookie.token.here")).thenReturn(true);
            when(jwtUtil.getEmailFromToken("cookie.token.here")).thenReturn("user@example.com");
            User user = new User();
            user.setEmail("user@example.com");
            user.setPassword("hashed_pw");
            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

            filter.doFilterInternal(request, response, filterChain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        }
    }
}
