package com.fittrack.repository;

import com.fittrack.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    /**
     * Find profile by user ID
     */
    Optional<UserProfile> findByUserId(Long userId);

    /**
     * Check if profile exists for user
     */
    boolean existsByUserId(Long userId);
}
