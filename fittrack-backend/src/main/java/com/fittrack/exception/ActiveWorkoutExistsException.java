package com.fittrack.exception;

public class ActiveWorkoutExistsException extends RuntimeException {
    public ActiveWorkoutExistsException(String message) {
        super(message);
    }
}
