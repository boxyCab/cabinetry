package com.boxy.cabinet_design.dto;

import com.boxy.cabinet_design.entity.Island;
import com.boxy.cabinet_design.entity.Kitchen;
import com.boxy.cabinet_design.entity.Wall;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.time.Instant;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
/**
 * DTO for {@link com.boxy.cabinet_design.entity.Appliance}
 */
public class ApplianceDto implements Serializable {
    private  Integer id;
//    private  Kitchen kitchen;
    private  Float width;
    private  Float height;
    private  Float angle;
    private  String name;
    private  Float position;
    private  Instant createdAt;
//    private  Island island;
    private  Instant updatedAt;
//    private  Wall wall;
    private  String applianceKind;

    @JsonCreator
    public ApplianceDto(
            @JsonProperty("id") Integer id,
//            @JsonProperty("kitchen") Kitchen kitchen,
            @JsonProperty("width") Float width,
            @JsonProperty("height") Float height,
            @JsonProperty("angle") Float angle,
            @JsonProperty("name") String name,
            @JsonProperty("position") Float position,
            @JsonProperty("createdAt") Instant createdAt,
            @JsonProperty("updatedAt") Instant updatedAt,
//            @JsonProperty("wall") Wall wall,
//            @JsonProperty("island") Island island,
            @JsonProperty("applianceKind") String applianceKind) {
        this.id = id;
//        this.kitchen = kitchen;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.name = name;
        this.position = position;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
//        this.wall = wall;
        this.applianceKind = applianceKind;
//        this.island = island;
    }
}