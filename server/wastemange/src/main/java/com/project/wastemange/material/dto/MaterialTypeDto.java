package com.project.wastemange.material.dto;

import com.project.wastemange.material.MaterialCategory;
import com.project.wastemange.material.MaterialType;

public class MaterialTypeDto {
    private Long id;
    private String name;
    private MaterialCategory category;
    private String defaultUnit;
    private String description;
    private boolean active;

    public MaterialTypeDto() {}

    public static MaterialTypeDto fromEntity(MaterialType material) {
        MaterialTypeDto dto = new MaterialTypeDto();
        dto.setId(material.getId());
        dto.setName(material.getName());
        dto.setCategory(material.getCategory());
        dto.setDefaultUnit(material.getDefaultUnit());
        dto.setDescription(material.getDescription());
        dto.setActive(material.isActive());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public MaterialCategory getCategory() {
        return category;
    }

    public void setCategory(MaterialCategory category) {
        this.category = category;
    }

    public String getDefaultUnit() {
        return defaultUnit;
    }

    public void setDefaultUnit(String defaultUnit) {
        this.defaultUnit = defaultUnit;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
