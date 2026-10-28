package com.project.wastemange.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByBuyerId(Long buyerId, Pageable pageable);

    Page<Order> findBySupplierId(Long supplierId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.buyer.id = :userId OR o.supplier.id = :userId")
    Page<Order> findByBuyerIdOrSupplierId(@Param("userId") Long userId, Pageable pageable);

    List<Order> findByListingId(Long listingId);
}
