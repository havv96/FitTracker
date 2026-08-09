package com.fittrack.controller;

import com.fittrack.dto.request.LoginRequest;
import com.fittrack.dto.request.RegisterRequest;
import com.fittrack.dto.response.AuthResponse;
import com.fittrack.exception.InvalidCredentialsException;
import com.fittrack.service.AuthService;
import com.fittrack.util.CookieUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication and registration endpoints")
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    @Operation(
            summary = "Register new user",
            description = "Creates a new user account. Returns access token in body and sets HttpOnly refresh cookie."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User successfully registered",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Email already exists")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 HttpServletResponse response) {
        log.info("POST /api/v1/auth/register - Registering new user: {}", request.getEmail());
        AuthResponse authResponse = authService.register(request);
        setRefreshCookie(authResponse.getRefreshToken(), response);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @Operation(
            summary = "User login",
            description = "Authenticates user. Returns access token in body and sets HttpOnly refresh cookie."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletResponse response) {
        log.info("POST /api/v1/auth/login - User login attempt: {}", request.getEmail());
        AuthResponse authResponse = authService.login(request);
        setRefreshCookie(authResponse.getRefreshToken(), response);
        return ResponseEntity.ok(authResponse);
    }

    @Operation(
            summary = "Refresh access token",
            description = "Reads refresh token from HttpOnly cookie, returns a new access token in the body and rotates the cookie."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Missing, invalid, or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(HttpServletRequest request,
                                                     HttpServletResponse response) {
        log.info("POST /api/v1/auth/refresh - Refreshing access token");
        String refreshToken = CookieUtils.readRefreshCookie(request)
                .orElseThrow(() -> new InvalidCredentialsException("Missing refresh token"));
        AuthResponse authResponse = authService.refreshAccessToken(refreshToken);
        setRefreshCookie(authResponse.getRefreshToken(), response);
        return ResponseEntity.ok(authResponse);
    }

    @Operation(summary = "Logout", description = "Clears the refresh token cookie.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        log.info("POST /api/v1/auth/logout");
        CookieUtils.clearRefreshCookie(response);
        return ResponseEntity.noContent().build();
    }

    private void setRefreshCookie(String token, HttpServletResponse response) {
        long maxAgeSeconds = refreshTokenExpirationMs / 1000;
        CookieUtils.setRefreshCookie(response, token, maxAgeSeconds);
    }
}
