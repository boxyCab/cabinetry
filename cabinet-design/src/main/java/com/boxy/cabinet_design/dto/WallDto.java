package com.boxy.cabinet_design.dto;

import java.io.Serializable;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for {@link com.boxy.cabinet_design.entity.Wall}
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class WallDto implements Serializable {
    private Integer id;
    @JsonIgnore
//    private KitchenObject kitchen;
    private Integer wallid;
    private String wallName;
    private Float width;
    private Float height;
    private Float angle;
    private String position;
    private String other_wall_id1;
    private String other_wall_id2;
    private String other_wall_id3;
    private String isLowerCabinetPlaced;
    private String isUpperCabinetPlaced;
    private Instant createdAt;
    private Instant updatedAt;
    private String pantryRequired;
    private String leftCorner;
    private String rightCorner;
    private String visibility;

    @JsonCreator
    public WallDto(
            @JsonProperty("id") Integer id,
            @JsonProperty("wallid") Integer wallid,
//            @JsonProperty("kitchen") KitchenObject kitchen,
            @JsonProperty("wallName") String wallName,
            @JsonProperty("width") Float width,
            @JsonProperty("height") Float height,
            @JsonProperty("angle") Float angle,
            @JsonProperty("position") String position,
            @JsonProperty("other_wall_id1") String otherWallId1,
            @JsonProperty("other_wall_id2") String otherWallId2,
            @JsonProperty("other_wall_id3") String otherWallId3,
            @JsonProperty("isLowerCabinetPlaced") String isLowerCabinetPlaced,
            @JsonProperty("isUpperCabinetPlaced") String isUpperCabinetPlaced,
            @JsonProperty("pantryRequired") String pantryRequired,
            @JsonProperty("leftCorner") String leftCorner,
            @JsonProperty("rightCorner") String rightCorner,
            @JsonProperty("visibility") String visibility,
            @JsonProperty("createdAt") Instant createdAt,
            @JsonProperty("updatedAt") Instant updatedAt) {
    	this.id = id;
    	this.wallid = wallid;
//        this.kitchen = kitchen;
        this.wallName = wallName;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.position = position;
        this.other_wall_id1 = otherWallId1;
        this.other_wall_id2 = otherWallId2;
        this.other_wall_id3 = otherWallId3;
        this.isLowerCabinetPlaced = isLowerCabinetPlaced;
        this.isUpperCabinetPlaced = isUpperCabinetPlaced;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.pantryRequired = pantryRequired;
        this.leftCorner = leftCorner;
        this.rightCorner = rightCorner;
        this.visibility = visibility;
    }


}