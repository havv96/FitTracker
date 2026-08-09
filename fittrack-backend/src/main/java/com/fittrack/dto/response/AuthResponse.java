package com.fittrack.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;

    /**
     * Refresh token — NOT serialized to JSON. Delivered to the client via HttpOnly cookie
     * (see CookieUtils and AuthController). Kept in the DTO so AuthService can hand it to
     * the controller in one object.
     */
    @JsonIgnore
    private String refreshToken;

    private String email;
    private Long userId;
}
