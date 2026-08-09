package com.fittrack.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain chain;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        chain = mock(FilterChain.class);
        // Provide ObjectMapper directly since MockitoExtension doesn't wire @Autowired final fields.
        org.springframework.test.util.ReflectionTestUtils.setField(filter, "objectMapper", new ObjectMapper());
    }

    @Test
    void noToken_passesThrough() throws Exception {
        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(200, response.getStatus());
    }

    @Test
    void validToken_authenticatesAndContinues() throws Exception {
        request.addHeader("Authorization", "Bearer valid-token");
        when(tokenProvider.validate("valid-token")).thenReturn(TokenValidationResult.VALID);
        when(tokenProvider.getEmailFromToken("valid-token")).thenReturn("user@example.com");
        when(userDetailsService.loadUserByUsername("user@example.com"))
                .thenReturn(new User("user@example.com", "",
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))));

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        assertEquals("user@example.com",
                SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    void expiredToken_returns401WithHeader_doesNotContinue() throws Exception {
        request.addHeader("Authorization", "Bearer expired-token");
        when(tokenProvider.validate("expired-token")).thenReturn(TokenValidationResult.EXPIRED);

        filter.doFilterInternal(request, response, chain);

        verify(chain, never()).doFilter(request, response);
        assertEquals(401, response.getStatus());
        String wwwAuth = response.getHeader("WWW-Authenticate");
        assertNotNull(wwwAuth);
        assertTrue(wwwAuth.contains("invalid_token"));
        assertTrue(wwwAuth.contains("Token expired"));
    }

    @Test
    void invalidToken_returns401_doesNotContinue() throws Exception {
        request.addHeader("Authorization", "Bearer tampered");
        when(tokenProvider.validate("tampered")).thenReturn(TokenValidationResult.INVALID);

        filter.doFilterInternal(request, response, chain);

        verify(chain, never()).doFilter(request, response);
        assertEquals(401, response.getStatus());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }
}
