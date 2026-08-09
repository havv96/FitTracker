package com.fittrack.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;
import java.util.Optional;

public final class CookieUtils {

    public static final String REFRESH_COOKIE_NAME = "refreshToken";
    public static final String REFRESH_COOKIE_PATH = "/api/v1/auth";
    public static final String SAME_SITE = "Strict";

    private CookieUtils() {}

    public static void setRefreshCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        String header = String.format(
                "%s=%s; Max-Age=%d; Path=%s; HttpOnly; Secure; SameSite=%s",
                REFRESH_COOKIE_NAME, token, maxAgeSeconds, REFRESH_COOKIE_PATH, SAME_SITE);
        response.addHeader("Set-Cookie", header);
    }

    public static void clearRefreshCookie(HttpServletResponse response) {
        String header = String.format(
                "%s=; Max-Age=0; Path=%s; HttpOnly; Secure; SameSite=%s",
                REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH, SAME_SITE);
        response.addHeader("Set-Cookie", header);
    }

    public static Optional<String> readRefreshCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        return Arrays.stream(cookies)
                .filter(c -> REFRESH_COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}
