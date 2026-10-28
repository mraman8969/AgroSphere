package com.project.wastemange.listing;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WasteListingRepository extends JpaRepository<WasteListing, Long> {

    Page<WasteListing> findByListingStatus(ListingStatus status, Pageable pageable);

    Page<WasteListing> findBySupplierId(Long supplierId, Pageable pageable);

    @Query("SELECT l FROM WasteListing l WHERE l.listingStatus = :status " +
           "AND (:materialTypeId IS NULL OR l.materialType.id = :materialTypeId) " +
           "AND (:city IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:state IS NULL OR LOWER(l.state) LIKE LOWER(CONCAT('%', :state, '%')))")
    Page<WasteListing> searchListings(
            @Param("status") ListingStatus status,
            @Param("materialTypeId") Long materialTypeId,
            @Param("city") String city,
            @Param("state") String state,
            Pageable pageable
    );

    List<WasteListing> findByListingStatusAndMaterialTypeId(ListingStatus status, Long materialTypeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM WasteListing l WHERE l.id = :id")
    Optional<WasteListing> findByIdWithPessimisticLock(@Param("id") Long id);
}
