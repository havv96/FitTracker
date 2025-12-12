package com.fittrack.controller;

import com.fittrack.model.Exercise;
import com.fittrack.service.WorkoutService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exercises")
@Slf4j
public class ExerciseController {

    @Autowired
    private WorkoutService workoutService;

    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercises() {
        log.info("GET /api/v1/exercises - Fetching all exercises");

        List<Exercise> exercises = workoutService.getAllExercises();

        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Exercise>> searchExercises(
            @RequestParam(required = false) String muscleGroup,
            @RequestParam(required = false) String equipmentType,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("GET /api/v1/exercises/search - muscle={}, equipment={}, search={}, page={}, size={}",
            muscleGroup, equipmentType, searchTerm, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<Exercise> exercises = workoutService.searchExercises(muscleGroup, equipmentType, searchTerm, pageable);

        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable Long id) {
        log.info("GET /api/v1/exercises/{} - Fetching exercise", id);

        Exercise exercise = workoutService.getExerciseById(id);

        return ResponseEntity.ok(exercise);
    }
}
