package com.boxy.cabinet_design.dto;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for {@link Cabinet}
 */
@Data
@NoArgsConstructor
public class CabinetDto implements Serializable  {
    
    private Integer id=0;
    private Float height =0f;
    private Float length=0f;
    private String name = "";
    private String cornerKey = "";
    private Float rotation=0f;
    private Integer i=0;
    private String construction;
    
    @JsonCreator
    public CabinetDto(
            @JsonProperty("id") Integer id2,
            @JsonProperty("height") Float height2,
            @JsonProperty("length") Float length2,
            @JsonProperty("name") String name2,
            @JsonProperty("width") Float width2,
            @JsonProperty("ceilingHeight") float ceilingHeight2,
            @JsonProperty("kitchenid") Integer kitchenid2,
            @JsonProperty("wallid") Integer wallid2,
            @JsonProperty("cabinettype") String cabinettype2,
            @JsonProperty("type") String type2,
            @JsonProperty("startposition") Float startposition2,
            @JsonProperty("depth") Integer depth2,
            @JsonProperty("leftobject") String leftobject2,
            @JsonProperty("rightobject") String rightobject2,
            @JsonProperty("i") int i,
            @JsonProperty("cornerKey") String cornerKey2,
            @JsonProperty("rotation") Float rotation2,
            @JsonProperty("construction") String construction) {
    	this.id = id2;
    	this.height = height2;
    	this.length = length2;
    	this.name = name2;
    	this.width = width2;
    	this.ceilingHeight = ceilingHeight2;
    	this.kitchenid = kitchenid2;
    	this.wallid = wallid2;
    	this.cabinettype = cabinettype2;
    	this.type = type2;
    	this.startposition = startposition2;
    	this.depth = depth2;
    	this.leftobject = leftobject2;
    	this.rightobject = rightobject2;
    	this.i = i;
 		this.cornerKey = cornerKey2;
    	this.rotation = rotation2;
    	this.construction = construction;
	}

	private Float width=0f;
    private float ceilingHeight=0;
    private Integer kitchenid=0;
    private Integer wallid=0;
    private String cabinettype = "";
    private String type = "";
    private Float startposition=0f;
    private Integer depth=0;
    private String leftobject = "";
    private String rightobject = "";
    private Integer updateFlg=0;
}