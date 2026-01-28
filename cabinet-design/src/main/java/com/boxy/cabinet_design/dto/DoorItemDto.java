package com.boxy.cabinet_design.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DoorItemDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String wallId;
    private String wallid;
    private String isadjacentto;
    private Float width;
    private Float height;
    private Float position;
    private Boolean hasDoor;
    private String name;  // 添加 name 字段

    @JsonCreator
    public DoorItemDto(
            @JsonProperty("wallId") String wallId,
            @JsonProperty("wallid") String wallid,
            @JsonProperty("isadjacentto") String isadjacentto,
            @JsonProperty("width") Float width,
            @JsonProperty("height") Float height,
            @JsonProperty("position") Float position,
            @JsonProperty("hasDoor") Boolean hasDoor,
            @JsonProperty("name") String name) {
        this.wallId = wallId;
        this.wallid = wallid;
        this.isadjacentto = isadjacentto;
        this.width = width;
        this.height = height;
        this.position = position;
        this.hasDoor = hasDoor;
        this.name = name;
    }

    public String getWallId() {
        return wallId;
    }

    public void setWallId(String wallId) {
        this.wallId = wallId;
    }

    public String getWallid() {
        return wallid;
    }

    public void setWallid(String wallid) {
        this.wallid = wallid;
    }

    public String getIsadjacentto() {
        return isadjacentto;
    }

    public void setIsadjacentto(String isadjacentto) {
        this.isadjacentto = isadjacentto;
    }

    public Float getWidth() {
        return width;
    }

    public void setWidth(Float width) {
        this.width = width;
    }

    public Float getHeight() {
        return height;
    }

    public void setHeight(Float height) {
        this.height = height;
    }

    public Float getPosition() {
        return position;
    }

    public void setPosition(Float position) {
        this.position = position;
    }

    public Boolean getHasDoor() {
        return hasDoor;
    }

    public void setHasDoor(Boolean hasDoor) {
        this.hasDoor = hasDoor;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
