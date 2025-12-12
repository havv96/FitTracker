package com.fittrack.repository;

import com.fittrack.model.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    List<Exercise> findByMuscleGroup(String muscleGroup);

    List<Exercise> findByEquipmentType(String equipmentType);

    List<Exercise> findByNameContainingIgnoreCase(String name);

    @Query("SELECT e FROM Exercise e WHERE " +
           "(:muscleGroup IS NULL OR e.muscleGroup = :muscleGroup) AND " +
           "(:equipmentType IS NULL OR e.equipmentType = :equipmentType) AND " +
           "(:searchTerm IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')))")
    Page<Exercise> searchExercises(
        @Param("muscleGroup") String muscleGroup,
        @Param("equipmentType") String equipmentType,
        @Param("searchTerm") String searchTerm,
        Pageable pageable
    );
}
