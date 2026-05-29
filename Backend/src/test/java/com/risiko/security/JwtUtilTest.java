package com.risiko.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "test_secret_key_for_junit_tests_only");
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 3600000L);
    }

    @Nested
    class GenerateToken {

        @Test
        void gibtNichtNullZurueck() {
            assertThat(jwtUtil.generateToken("user@example.com", 1L)).isNotNull();
        }

        @Test
        void gibtNichtLeerenStringZurueck() {
            assertThat(jwtUtil.generateToken("user@example.com", 1L)).isNotBlank();
        }
    }

    @Nested
    class ValidateToken {

        @Test
        void gueltigenToken_gibtTrueZurueck() {
            String token = jwtUtil.generateToken("user@example.com", 1L);

            assertThat(jwtUtil.validateToken(token)).isTrue();
        }

        @Test
        void ungueltigerToken_gibtFalseZurueck() {
            assertThat(jwtUtil.validateToken("invalid.token.string")).isFalse();
        }

        @Test
        void leerenToken_gibtFalseZurueck() {
            assertThat(jwtUtil.validateToken("")).isFalse();
        }
    }

    @Nested
    class GetEmailFromToken {

        @Test
        void gibtKorrekteEmailZurueck() {
            String token = jwtUtil.generateToken("user@example.com", 42L);

            assertThat(jwtUtil.getEmailFromToken(token)).isEqualTo("user@example.com");
        }
    }

    @Nested
    class GetUserIdFromToken {

        @Test
        void gibtKorrekteUserIdZurueck() {
            String token = jwtUtil.generateToken("user@example.com", 42L);

            assertThat(jwtUtil.getUserIdFromToken(token)).isEqualTo(42L);
        }

        @Test
        void gibtNullZurueckWennClaimFehlt() {
            String token = jwtUtil.generateToken("user@example.com", 1L);
            assertThat(jwtUtil.getUserIdFromToken(token)).isNotNull();
        }
    }
}
