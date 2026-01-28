package com.boxy.cabinet_design.dto;

import com.boxy.cabinet_design.entity.Kitchen;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
public class ApplianceModelDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer id;
    private Kitchen kitchen;
    private boolean hasRefrigerator;
    private boolean hasDishwasher;
    private boolean hasRange;
    private boolean hasHood;
    private Float refrigeratorWidth;
    private Float rangeWidth;
    private Float dishwasherWidth;
    private Float hoodWidth;
    private Float refrigeratorPosition;
    private Float dishwasherPosition;
    private Float rangePosition;
    private Float hoodPosition;
    private Float hoodHeight;
    private String refriisadjacentto;
    private String diswasherriisadjacentto;
    private String rangeisadjacentto;
    private String hoodisadjacentto;

    @JsonCreator
    public ApplianceModelDto(
            @JsonProperty("id") Integer id,
            @JsonProperty("kitchen") Kitchen kitchen,
            @JsonProperty("hasRefrigerator") boolean hasRefrigerator,
            @JsonProperty("hasDishwasher") boolean hasDishwasher,
            @JsonProperty("hasRange") boolean hasRange,
            @JsonProperty("refrigeratorWidth") Float refrigeratorWidth,
            @JsonProperty("rangeWidth") Float rangeWidth,
            @JsonProperty("dishwasherWidth") Float dishwasherWidth,
            @JsonProperty("refrigeratorPosition") Float refrigeratorPosition,
            @JsonProperty("dishwasherPosition") Float dishwasherPosition,
            @JsonProperty("rangePosition") Float rangePosition,
            @JsonProperty("refriisadjacentto") String refriisadjacentto,
            @JsonProperty("diswasherriisadjacentto") String diswasherriisadjacentto,
            @JsonProperty("rangeisadjacentto") String rangeisadjacentto,
            @JsonProperty("hasHood") boolean hasHood,
            @JsonProperty("hoodWidth") Float hoodWidth,
            @JsonProperty("hoodPosition") Float hoodPosition,
            @JsonProperty("hoodisadjacentto") String hoodisadjacentto,
            @JsonProperty("hoodHeight") Float hoodHeight) {
        this.id = id;
        this.kitchen = kitchen;
        this.hasRefrigerator = hasRefrigerator;
        this.hasDishwasher = hasDishwasher;
        this.hasHood = hasHood;
        this.hasRange = hasRange;
        this.refrigeratorWidth = refrigeratorWidth;
        this.rangeWidth = rangeWidth;
        this.dishwasherWidth = dishwasherWidth;
        this.hoodWidth = hoodWidth;
        this.refrigeratorPosition = refrigeratorPosition;
        this.dishwasherPosition = dishwasherPosition;
        this.rangePosition = rangePosition;
        this.hoodPosition = hoodPosition;
        this.refriisadjacentto = refriisadjacentto;
        this.diswasherriisadjacentto = diswasherriisadjacentto;
        this.rangeisadjacentto = rangeisadjacentto;
        this.hoodisadjacentto = hoodisadjacentto;
        this.hoodHeight = hoodHeight;
    }
}
