package com.fittrack.security;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String VALID_BASE64_SECRET =
            Base64.getEncoder().encodeToString(new byte[32]); // 32 zero-bytes → 44 char base64

    private JwtTokenProvider newProvider(String secret) {
        JwtTokenProvider p = new JwtTokenProvider();
        ReflectionTestUtils.setField(p, "jwtSecret", secret);
        ReflectionTestUtils.setField(p, "accessTokenExpiration", 900_000L);
        ReflectionTestUtils.setField(p, "refreshTokenExpiration", 604_800_000L);
        return p;
    }

    @Test
    void init_blankSecret_refuses() {
        assertThrows(IllegalStateException.class, () -> newProvider("").initSigningKey());
    }

    @Test
    void init_nullSecret_refuses() {
        JwtTokenProvider p = new JwtTokenProvider();
        ReflectionTestUtils.setField(p, "accessTokenExpiration", 1L);
        ReflectionTestUtils.setField(p, "refreshTokenExpiration", 1L);
        assertThrows(IllegalStateException.class, p::initSigningKey);
    }

    @Test
    void init_knownDefault_refuses() {
        assertThrows(IllegalStateException.class,
                () -> newProvider("default-secret-change-me-in-production").initSigningKey());
        assertThrows(IllegalStateException.class,
                () -> newProvider("your-256-bit-secret-key-change-in-production").initSigningKey());
    }

    @Test
    void init_notBase64_refuses() {
        // Contains '!' which is invalid in base64.
        assertThrows(IllegalStateException.class,
                () -> newProvider("this-is-not-valid-base64!").initSigningKey());
    }

    @Test
    void init_tooShortBase64_refuses() {
        // 16 zero-bytes base64-encoded = 24 chars, decodes to 16 bytes (< 32).
        String tooShort = Base64.getEncoder().encodeToString(new byte[16]);
        assertThrows(IllegalStateException.class,
                () -> newProvider(tooShort).initSigningKey());
    }

    @Test
    void init_validSecret_generatesAndValidatesTokens() {
        JwtTokenProvider p = newProvider(VALID_BASE64_SECRET);
        p.initSigningKey();

        String token = p.generateAccessToken("user@example.com");
        assertNotNull(token);
        assertEquals(TokenValidationResult.VALID, p.validate(token));
        assertEquals("user@example.com", p.getEmailFromToken(token));
    }

    @Test
    void validate_tamperedToken_returnsInvalid() {
        JwtTokenProvider p = newProvider(VALID_BASE64_SECRET);
        p.initSigningKey();
        String token = p.generateAccessToken("user@example.com");
        String tampered = token.substring(0, token.length() - 4) + "xxxx";
        assertEquals(TokenValidationResult.INVALID, p.validate(tampered));
    }

    @Test
    void validate_expiredToken_returnsExpired() {
        JwtTokenProvider p = new JwtTokenProvider();
        ReflectionTestUtils.setField(p, "jwtSecret", VALID_BASE64_SECRET);
        ReflectionTestUtils.setField(p, "accessTokenExpiration", -1_000L); // already expired
        ReflectionTestUtils.setField(p, "refreshTokenExpiration", -1_000L);
        p.initSigningKey();

        String expired = p.generateAccessToken("user@example.com");
        assertEquals(TokenValidationResult.EXPIRED, p.validate(expired));
    }
}
