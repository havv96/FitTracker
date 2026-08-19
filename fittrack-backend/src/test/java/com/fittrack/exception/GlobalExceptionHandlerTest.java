package com.fittrack.exception;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fittrack.model.UserProfile;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.http.HttpMethod;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    private HttpServletRequest requestFor(String uri) {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        Mockito.when(request.getRequestURI()).thenReturn(uri);
        Mockito.when(request.getMethod()).thenReturn("GET");
        return request;
    }

    @Test
    void handleGeneralException_returnsGenericMessage_notExceptionMessage() {
        HttpServletRequest request = requestFor("/api/v1/workouts");

        RuntimeException sensitive = new RuntimeException(
                "SQL error: could not connect to db://prod-master:5432 as fittrack_user");

        ResponseEntity<ErrorResponse> response = handler.handleGeneralException(sensitive, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        // Regression check: original exception message must NOT leak into the response.
        assertEquals("Internal server error", body.getMessage());
    }

    @Test
    void handleMissingParam_returns400WithParamName() {
        MissingServletRequestParameterException ex =
                new MissingServletRequestParameterException("startDate", "LocalDate");

        ResponseEntity<ErrorResponse> response = handler.handleMissingParam(
                ex, requestFor("/api/v1/workouts/history"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("Missing request parameter", body.getMessage());
        assertNotNull(body.getFieldErrors());
        assertEquals(1, body.getFieldErrors().size());
        assertEquals("startDate", body.getFieldErrors().get(0).getField());
    }

    @Test
    void handleTypeMismatch_returns400WithFieldAndRejectedValue() throws NoSuchMethodException {
        // MethodArgumentTypeMismatchException needs a MethodParameter; borrow one from this class.
        MethodParameter methodParameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("dummy", LocalDate.class), 0);
        MethodArgumentTypeMismatchException ex = new MethodArgumentTypeMismatchException(
                "not-a-date", LocalDate.class, "date", methodParameter,
                new IllegalArgumentException("bad date"));

        ResponseEntity<ErrorResponse> response = handler.handleTypeMismatch(
                ex, requestFor("/api/v1/metrics/date/not-a-date"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("Invalid parameter value", body.getMessage());
        assertEquals("date", body.getFieldErrors().get(0).getField());
        assertEquals("not-a-date", body.getFieldErrors().get(0).getRejectedValue());
    }

    @Test
    void handleUnreadableBody_forEnumMismatch_returns400WithAllowedValues() {
        InvalidFormatException ife = InvalidFormatException.from(
                (JsonParser) null,
                "Cannot deserialize",
                "MAINTAIN_WEIGHT",
                UserProfile.WeightGoal.class);
        ife.prependPath(new JsonMappingException.Reference(this, "weightGoal"));

        HttpMessageNotReadableException wrapper = new HttpMessageNotReadableException(
                "Cannot deserialize", ife, new MockHttpInputMessage(new byte[0]));

        ResponseEntity<ErrorResponse> response = handler.handleUnreadableBody(
                wrapper, requestFor("/api/v1/profile"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("Malformed request body", body.getMessage());
        assertNotNull(body.getFieldErrors());
        ErrorResponse.FieldError fe = body.getFieldErrors().get(0);
        assertEquals("weightGoal", fe.getField());
        assertEquals("MAINTAIN_WEIGHT", fe.getRejectedValue());
        assertTrue(fe.getMessage().contains("WeightGoal"),
                "message should name the enum type, was: " + fe.getMessage());
        assertTrue(fe.getMessage().contains("MAINTAIN"),
                "message should list allowed values, was: " + fe.getMessage());
    }

    @Test
    void handleUnreadableBody_forMalformedJson_returnsGeneric400() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
                "JSON parse error", new MockHttpInputMessage(new byte[0]));

        ResponseEntity<ErrorResponse> response = handler.handleUnreadableBody(
                ex, requestFor("/api/v1/profile"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("Malformed request body", body.getMessage());
    }

    @Test
    void handleNoResource_returns404() {
        NoResourceFoundException ex = new NoResourceFoundException(HttpMethod.GET, "api/v1/workouts");

        ResponseEntity<ErrorResponse> response = handler.handleNoResource(
                ex, requestFor("/api/v1/workouts/"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("Resource not found", body.getMessage());
    }

    // Referenced by handleTypeMismatch_returns400WithFieldAndRejectedValue to build a MethodParameter.
    @SuppressWarnings("unused")
    private void dummy(LocalDate date) {
    }
}
