package com.project.wastemange.material;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialTypeRepository extends JpaRepository<MaterialType, Long> {
    List<MaterialType> findByActiveTrue();
    Optional<MaterialType> findByNameIgnoreCase(String name);
}
