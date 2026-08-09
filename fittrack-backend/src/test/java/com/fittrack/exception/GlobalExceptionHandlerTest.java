package com.fittrack.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleGeneralException_returnsGenericMessage_notExceptionMessage() {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        Mockito.when(request.getRequestURI()).thenReturn("/api/v1/workouts");
        Mockito.when(request.getMethod()).thenReturn("GET");

        RuntimeException sensitive = new RuntimeException(
                "SQL error: could not connect to db://prod-master:5432 as fittrack_user");

        ResponseEntity<ErrorResponse> response = handler.handleGeneralException(sensitive, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("Internal server error", body.getMessage());
        // Regression check: original exception message must NOT leak into the response.
        assertEquals("Internal server error", body.getMessage(),
                "Response body must not contain the exception message");
    }
}
