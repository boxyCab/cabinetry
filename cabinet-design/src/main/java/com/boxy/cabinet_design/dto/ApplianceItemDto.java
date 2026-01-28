package com.boxy.cabinet_design.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for individual appliance item from frontend
 * Matches the new array format: [{appliancekind, position, wallId, width, height}]
 */
@Data
@NoArgsConstructor
public class ApplianceItemDto implements Serializable {
    private String appliancekind;  // e.g., "Refrigerator", "Dishwasher", "Range", "Hood"
    private Float position;         // Position on the wall or island
    private String wallId;          // "one", "two", "three", "four", or "island"
    private Float width;            // Appliance width
    private Float height;           // Appliance height
    private String name;            // Appliance name from frontend

    public ApplianceItemDto(String appliancekind, Float position, String wallId, Float width, Float height, String name) {
        this.appliancekind = appliancekind;
        this.position = position;
        this.wallId = wallId;
        this.width = width;
        this.height = height;
        this.name = name;
    }
}
