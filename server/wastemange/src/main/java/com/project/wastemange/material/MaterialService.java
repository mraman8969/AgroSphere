package com.project.wastemange.material;

import com.project.wastemange.common.ResourceNotFoundException;
import com.project.wastemange.material.dto.MaterialTypeDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialService {

    private final MaterialTypeRepository materialTypeRepository;

    public MaterialService(MaterialTypeRepository materialTypeRepository) {
        this.materialTypeRepository = materialTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<MaterialTypeDto> getAllActiveMaterials() {
        return materialTypeRepository.findByActiveTrue().stream()
                .map(MaterialTypeDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MaterialType getMaterialEntityById(Long id) {
        return materialTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaterialType", "id", id));
    }
}
