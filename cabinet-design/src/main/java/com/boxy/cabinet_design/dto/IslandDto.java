package com.boxy.cabinet_design.dto;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for {@link Window.Island}
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class IslandDto implements Serializable {
    private  Integer id;
    private  String islandKind;
    private  float width;
    private  String peninsulaisadjacentto;
    private  Float length;
    private Boolean isOverhang;
    private String horverType;
    private Boolean isWaterfall;

    @JsonCreator
    public IslandDto(
            @JsonProperty("id") Integer id,
            @JsonProperty("islandKind") String islandKind,
            @JsonProperty("width") float width,
            @JsonProperty("peninsulaisadjacentto") String peninsulaisadjacentto,
            @JsonProperty("length") Float length,
            @JsonProperty("isOverhang") Boolean isOverhang,
            @JsonProperty("horverType") String horverType,
            @JsonProperty("isWaterfall") Boolean isWaterfall) {
        this.id = id;
        this.islandKind = islandKind;
        this.width = width;
        this.peninsulaisadjacentto = peninsulaisadjacentto;
        this.length = length;
        this.isOverhang = isOverhang;
        this.horverType = horverType;
        this.isWaterfall = isWaterfall;
    }
}