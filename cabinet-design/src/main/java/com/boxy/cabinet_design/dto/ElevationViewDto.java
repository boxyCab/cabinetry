package com.boxy.cabinet_design.dto;

import java.io.Serializable;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class ElevationViewDto implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private KitchenObject kitchenObject;
    private List<WallDto> wallObjects;
    private List<WindowDto> windowObjects;
    private List<DoorDto> doorObjects;
    private ApplianceModelDto applianceObject;
    private IslandDto islandObject;
    //private final String typeK;

    public void setWallObjects(List<WallDto> wallObjects) {
        this.wallObjects = wallObjects;
    }

    public void setWindowObjects(List<WindowDto> windowObjects) {
        this.windowObjects = windowObjects;
    }


	public void setDoorObjects(List<DoorDto> doorObjects) {
        this.doorObjects = doorObjects;
    }

    public void setApplianceObject(ApplianceModelDto applianceObject) {
        this.applianceObject = applianceObject;
    }

    public void setIslandObject(IslandDto islandObject) {
        this.islandObject = islandObject;
    }

    @JsonCreator
    public ElevationViewDto(
            @JsonProperty("kitchenObject") KitchenObject kitchenObject,
            @JsonProperty("wallObjects") List<WallDto> wallObjects,
            @JsonProperty("windowObjects") List<WindowDto> windowObjects,
            @JsonProperty("doorObjects") List<DoorDto> doorObjects,
            @JsonProperty("applianceObject") ApplianceModelDto applianceObject,
            @JsonProperty("islandObject") IslandDto islandObject
    		) {
    	  
            this.kitchenObject = kitchenObject;
            this.wallObjects = wallObjects;
            this.windowObjects = windowObjects;
            this.doorObjects = doorObjects;
            this.applianceObject = applianceObject;
            this.islandObject = islandObject;

    }
    // Getters and Setters
    public KitchenObject getKitchenObject() {
        return kitchenObject;
    }

    public void setKitchenObject(KitchenObject kitchenObject) {
        this.kitchenObject = kitchenObject;
    }

    public List<WallDto> getWallObjects() {
        return wallObjects;
    }

    public List<WindowDto> getWindowObjects() {
        return windowObjects;
    }

    public List<DoorDto> getDoorObjects() {
        return doorObjects;
    }

    public ApplianceModelDto getApplianceObject() {
        return applianceObject;
    }

    public IslandDto getIslandObject() {
        return islandObject;
    }

//    @Override
//    public boolean equals(Object o) {
//        if (this == o) return true;
//        if (o == null || getClass() != o.getClass()) return false;
//        KitchenObjectReqDto entity = (KitchenObjectReqDto) o;
//        return Objects.equals(this.kitchenObject, entity.kitchenObject) &&
////        		Objects.equals(this.nameK, entity.nameK) &&
//                Objects.equals(this.wallObjects, entity.wallObjects);
//    }

    @Override
    public int hashCode() {
        return Objects.hash(kitchenObject, wallObjects);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "(" +
        		"kitDto = " + kitchenObject + ", " +
//                "nameK = " + wallDto + ", " +
                "wallDto = " + wallObjects + ")";
    }
}
