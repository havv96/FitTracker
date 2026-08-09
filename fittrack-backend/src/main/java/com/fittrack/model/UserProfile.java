package com.fittrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "height_cm")
    private BigDecimal heightCm;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_level")
    private ActivityLevel activityLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "weight_goal")
    private WeightGoal weightGoal;

    @Column(name = "target_weight_kg")
    private BigDecimal targetWeightKg;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum Gender {
        MALE, FEMALE
    }

    public enum ActivityLevel {
        SEDENTARY,
        LIGHTLY_ACTIVE,
        MODERATELY_ACTIVE,
        VERY_ACTIVE,
        EXTRA_ACTIVE
    }

    public enum WeightGoal {
        LOSE_SLOW,
        LOSE_MODERATE,
        LOSE_FAST,
        MAINTAIN,
        GAIN_SLOW,
        GAIN_MODERATE
    }
}
