package com.project.wastemange.buyer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuyerRequirementRepository extends JpaRepository<BuyerMaterialRequirement, Long> {
    List<BuyerMaterialRequirement> findByBuyerId(Long buyerId);
    Page<BuyerMaterialRequirement> findByBuyerId(Long buyerId, Pageable pageable);
    List<BuyerMaterialRequirement> findByBuyerIdAndActiveTrue(Long buyerId);
    List<BuyerMaterialRequirement> findByActiveTrue();
}
