package com.boxy.cabinet_design.dto;

import java.io.Serializable;
import java.time.Instant;

import com.boxy.cabinet_design.entity.Kitchen;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;




/**
 * DTO for {@link com.boxy.cabinet_design.entity.Canvasobject}
 */
@Data
@NoArgsConstructor
public class CanvasobjectDto implements Serializable {

    private Integer id =0;
    private  String objectType = "";
    private  Float x;
    private  Float y;
    private  Float width;
    private  Float height;
    private  Float rotation;
    private  String color;
    @ToString.Exclude
    private  Kitchen kitchen;
    private  String cabinettype;
    private  String data;
    private  Instant createdAt;
    private  Instant updatedAt;
    private  Integer relatedId;
    private  String objectname;
    private  Integer kitchenId;
    private  Float scale = 1f;
    private  Float depth;
    private  Integer wallid;
    private  Integer updateFlg;
    private  Integer relatedId2;
    private float widthcabinet;
    private float heightcabinet;
    private float depthcabinet;
    
    public Integer getRelatedId2() {
        return relatedId2;
    }
    
    @JsonCreator
    public CanvasobjectDto(
            @JsonProperty("id") Integer id,
            @JsonProperty("objectType") String objectType,
            @JsonProperty("x") Float x,
            @JsonProperty("y") Float y,
            @JsonProperty("width") Float width,
            @JsonProperty("height") Float height,
            @JsonProperty("rotation") Float rotation,
            @JsonProperty("color") String color,
            @JsonProperty("data") String data,
            @JsonProperty("createdAt") Instant createdAt,
            @JsonProperty("updatedAt") Instant updatedAt,
            @JsonProperty("relatedId") Integer relatedId,
            @JsonProperty("objectname") String objectname,
            @JsonProperty("kitchenId") Integer kitchenId,
            @JsonProperty("scale") Float scale,
            @JsonProperty("kitchen") Kitchen kitchen,
            @JsonProperty("cabinettype") String cabinettype,
            @JsonProperty("depth") Float depth,
            @JsonProperty("wallid") Integer wallid,
            @JsonProperty("updateFlg") Integer updateFlg,
            @JsonProperty("relatedId2") Integer relatedId2,
            @JsonProperty("widthcabinet") float widthcabinet,
            @JsonProperty("heightcabinet") float heightcabinet,
            @JsonProperty("depthcabinet") float depthcabinet) {
        this.id = id;
        this.objectType = objectType;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.color = color;
        this.data = data;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.relatedId = relatedId;
        this.objectname = objectname;
        this.kitchenId = kitchenId;
        this.scale = scale;
        this.kitchen = kitchen;
        this.cabinettype = cabinettype;
        this.depth = depth;
        this.wallid = wallid;
        this.updateFlg = updateFlg;
        this.relatedId2 = relatedId2;
        this.widthcabinet = widthcabinet;
        this.heightcabinet = heightcabinet;
        this.depthcabinet = depthcabinet;
    }
}