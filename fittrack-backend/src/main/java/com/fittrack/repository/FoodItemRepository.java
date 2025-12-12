package com.fittrack.repository;

import com.fittrack.model.FoodItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByNameContainingIgnoreCase(String name);

    Optional<FoodItem> findByBarcode(String barcode);

    Page<FoodItem> findByIsVerified(Boolean isVerified, Pageable pageable);

    @Query("SELECT f FROM FoodItem f WHERE " +
           "(:searchTerm IS NULL OR " +
           "LOWER(f.name) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')) OR " +
           "LOWER(COALESCE(f.brand, '')) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%'))) AND " +
           "(:verifiedOnly = FALSE OR f.isVerified = TRUE)")
    Page<FoodItem> searchFoodItems(
        @Param("searchTerm") String searchTerm,
        @Param("verifiedOnly") Boolean verifiedOnly,
        Pageable pageable
    );
}
