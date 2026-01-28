package com.boxy.cabinet_design.dto;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)  // Ignore unknown fields from frontend
public class KitchenObjectReqDto implements Serializable {
	private static final long serialVersionUID = 1L;

	private KitchenObject kitchenObject;
	private List<WallDto> wallObjects;
	private List<WindowDto> windowObjects;
	private List<DoorDto> doorObjects;
	private IslandDto islandObject;
	private List<ApplianceItemDto> applianceObject;  // New format: array of appliance items


	@JsonCreator
	public KitchenObjectReqDto(
			@JsonProperty("kitchenObject") KitchenObject kitchenObject,
			@JsonProperty("wallObjects") List<WallDto> wallObjects,
			@JsonProperty("windowObjects") List<WindowDto> windowObjects,
			@JsonProperty("doorObjects") List<DoorDto> doorObjects,
			@JsonProperty("islandObject") IslandDto islandObject,
			@JsonProperty("applianceObject") List<ApplianceItemDto> applianceObject
		) {
		this.kitchenObject = kitchenObject;
		this.wallObjects = wallObjects;
		this.windowObjects = windowObjects;
		this.doorObjects = doorObjects;
		this.applianceObject = applianceObject;
		this.islandObject = islandObject;
	}
}
