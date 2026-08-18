package com.fittrack.service;

import com.fittrack.dto.request.LoginRequest;
import com.fittrack.dto.request.RegisterRequest;
import com.fittrack.dto.response.AuthResponse;
import com.fittrack.exception.InvalidCredentialsException;
import com.fittrack.exception.UserAlreadyExistsException;
import com.fittrack.model.User;
import com.fittrack.model.UserProfile;
import com.fittrack.repository.UserProfileRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    /**
     * Register a new user
     * US-01: User Registration
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());

        // AC: Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new UserAlreadyExistsException("Email already in use");
        }

        // AC: Hash password with BCrypt (complexity enforced by @Pattern/@Size on RegisterRequest)
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .role("USER")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully with ID: {}", user.getId());

        // Ensure a profile row exists so GET /profile does not 404 for brand-new users.
        // All profile columns are nullable; the frontend detects the empty state and shows setup.
        if (!userProfileRepository.existsByUserId(user.getId())) {
            userProfileRepository.save(UserProfile.builder().userId(user.getId()).build());
        }

        // Generate JWT tokens
        String accessToken = tokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .userId(user.getId())
                .build();
    }

    /**
     * Authenticate user and generate tokens
     * US-02: User Login
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting to login user with email: {}", request.getEmail());

        try {
            // AC: Authenticate user with Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // AC: Find user and generate tokens
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

            log.info("User logged in successfully: {}", user.getEmail());

            // AC: Generate JWT Access Token and Refresh Token
            String accessToken = tokenProvider.generateAccessToken(user.getEmail());
            String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .email(user.getEmail())
                    .userId(user.getId())
                    .build();

        } catch (AuthenticationException e) {
            log.error("Login failed for email: {}", request.getEmail());
            // AC: Return 401 for invalid credentials
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional(readOnly = true)
    public AuthResponse refreshAccessToken(String refreshToken) {
        log.info("Attempting to refresh access token");

        if (!tokenProvider.validateToken(refreshToken)) {
            log.warn("Invalid or expired refresh token");
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        String newAccessToken = tokenProvider.generateAccessToken(user.getEmail());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        log.info("Access token refreshed successfully for user: {}", email);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .email(user.getEmail())
                .userId(user.getId())
                .build();
    }
}
