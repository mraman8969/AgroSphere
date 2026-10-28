package com.project.wastemange.material;

import com.project.wastemange.common.ApiResponse;
import com.project.wastemange.material.dto.MaterialTypeDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@Tag(name = "Materials", description = "Material type catalog endpoints")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    @Operation(summary = "Get list of all active recyclable and compostable waste materials")
    public ResponseEntity<ApiResponse<List<MaterialTypeDto>>> getAllMaterials() {
        List<MaterialTypeDto> materials = materialService.getAllActiveMaterials();
        return ResponseEntity.ok(ApiResponse.success(materials));
    }
}
