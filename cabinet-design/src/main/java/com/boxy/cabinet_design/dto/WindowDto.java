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
 * DTO for {@link com.boxy.cabinet_design.entity.Window}
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class WindowDto implements Serializable {
    private  Integer id;
//    private  Kitchen kitchen;
    private  Float width;
    private  Float height;
    private  Float angle;
    private  Float position;
    private  Instant createdAt;
    private  Instant updatedAt;
//    private  WallDto wall;
    private  Boolean hasWindow;
    private  String windowName;
    private  String wallId;

    @JsonCreator
    public WindowDto(
            @JsonProperty("id") Integer id,
//            @JsonProperty("kitchen") Kitchen kitchen,
            @JsonProperty("width") Float width,
            @JsonProperty("height") Float height,
            @JsonProperty("angle") Float angle,
            @JsonProperty("position") Float position,
            @JsonProperty("createdAt") Instant createdAt,
            @JsonProperty("updatedAt") Instant updatedAt,
//            @JsonProperty("wall") WallDto wall,
            @JsonProperty("hasWindow") Boolean hasWindow,
            @JsonProperty("windowName") String windowName,
            @JsonProperty("wallId") String wallId) {
        this.id = id;
//        this.kitchen = kitchen;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.position = position;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
//        this.wall = wall;
        this.hasWindow = hasWindow;
        this.windowName = windowName;
        this.wallId = wallId;
    }
}