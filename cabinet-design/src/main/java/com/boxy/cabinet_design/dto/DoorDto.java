package com.boxy.cabinet_design.dto;

import com.boxy.cabinet_design.entity.Kitchen;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.time.Instant;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for {@link com.boxy.cabinet_design.entity.Door}
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DoorDto implements Serializable {
    private  Integer id;
//    private  Kitchen kitchen;
    private  Float width;
    private  Float height;
    private  Float angle;
    private  Float position;
    private  Instant createdAt;
    private  Instant updatedAt;
    private  String doorName;
    private  String wallId;
//    private  WallDto wall;
    private  Boolean hasDoor;

    @JsonCreator
    public DoorDto(
            @JsonProperty("id") Integer id,
//            @JsonProperty("kitchen") Kitchen kitchen,
            @JsonProperty("width") Float width,
            @JsonProperty("height") Float height,
            @JsonProperty("angle") Float angle,
            @JsonProperty("position") Float position,
            @JsonProperty("createdAt") Instant createdAt,
            @JsonProperty("updatedAt") Instant updatedAt,
            @JsonProperty("doorName") String doorName,
            @JsonProperty("wallId") String wallId,
//            @JsonProperty("wall") WallDto wall,
            @JsonProperty("hasDoor") Boolean hasDoor) {
        this.id = id;
//        this.kitchen = kitchen;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.position = position;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.doorName = doorName;
        this.wallId = wallId;
//        this.wall = wall;
        this.hasDoor = hasDoor;
    }
}