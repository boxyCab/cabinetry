package com.boxy.cabinet_design.dto;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
@Data
@NoArgsConstructor
public class CanvasData implements Serializable {


	@JsonProperty("kitchenId") private Integer kitchenId;
	@JsonProperty("canvasId") private Integer canvasId;
	@JsonProperty("cabinetObjectDtoList") private List<CanvasobjectDto> cabinetObjectDtoList = new ArrayList<>();
	@JsonProperty("cabinetDtoList") private List<CabinetDto> cabinetDtoList = new ArrayList<>();

    @JsonCreator
    public CanvasData(Integer kitchenId, Integer canvasId, List<CanvasobjectDto> cabinetObjectDtoList, List<CabinetDto> cabinetDtoList) {
        this.kitchenId = kitchenId;
        this.canvasId = canvasId;        
        this.cabinetObjectDtoList = cabinetObjectDtoList;
        this.cabinetDtoList = cabinetDtoList;
    }

    public Integer getCanvasId() {
		return canvasId;
	}

	public void setCanvasId(Integer canvasId) {
		this.canvasId = canvasId;
	}

	public List<CabinetDto> getCabinetDtoList() {
        return cabinetDtoList;
    }

    public void setCabinetDtoList(List<CabinetDto> cabinetDtoList) {
        this.cabinetDtoList = cabinetDtoList;
    }

    public Integer getKitchenId() {
        return kitchenId;
    }

    public void setKitchenId(Integer kitchenId) {
        this.kitchenId = kitchenId;
    }

    public List<CanvasobjectDto> getCabinetObjectDtoList() {
        return cabinetObjectDtoList;
    }

    public void setCabinetObjectDtoList(List<CanvasobjectDto> cabinetObjectDtoList) {
        this.cabinetObjectDtoList = cabinetObjectDtoList;
    }
}



