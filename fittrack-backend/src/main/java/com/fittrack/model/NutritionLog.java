package com.fittrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nutrition_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NutritionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "meal_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private MealType mealType;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal servings;

    @Column(name = "total_calories", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalCalories;

    @Column(name = "total_protein_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalProteinG;

    @Column(name = "total_carbs_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalCarbsG;

    @Column(name = "total_fat_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalFatG;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt;

    @PrePersist
    protected void onCreate() {
        if (loggedAt == null) {
            loggedAt = LocalDateTime.now();
        }
    }

    public enum MealType {
        BREAKFAST,
        LUNCH,
        DINNER,
        SNACK,
        PRE_WORKOUT,
        POST_WORKOUT
    }
}
