package com.project.wastemange.buyer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BuyerProfileRepository extends JpaRepository<BuyerProfile, Long> {
    Optional<BuyerProfile> findByUserId(Long userId);
}
