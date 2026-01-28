package com.boxy.cabinet_design.dto;

import java.io.Serializable;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for {@link com.boxy.cabinet_design.entity.Kitchen}
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class KitchenObject  implements Serializable {
	private  String id;
    private  String kitchenName;
    private  String shapeType;
    private  String ceilingHeight;
    private  String construction1;
    private  String construction2;
    private  String construction3;
    private  String notes;

    @JsonCreator
    public KitchenObject (@JsonProperty("id")String id, 
    		@JsonProperty("kitchenName") String kitchenName, 
    		@JsonProperty("shapeType")String shapeType, 
    		@JsonProperty("ceilingHeight")String ceilingHeight,
    		@JsonProperty("construction1")String construction1, 
    		@JsonProperty("construction2")String construction2, 
    		@JsonProperty("construction3")String construction3,
            @JsonProperty("notes")String notes) {
    	this.id = id;
        this.kitchenName = kitchenName;
        this.shapeType = shapeType;
        this.ceilingHeight = ceilingHeight;
        this.construction1 = construction1;
        this.construction2 = construction2;
        this.construction3 = construction3;
        this.notes = notes;
    }
    public String getId() {
        return id;
    }
    public String getKitchenName() {
        return kitchenName;
    }
    public String getShapeType() {
        return shapeType;
    }
    public String getCeilingHeight() {return ceilingHeight;}
    public String getConstruction1() {return construction1;}
    public String getConstruction2() {return construction2;}
    public String getConstruction3() {return construction3;}
    public String getNotes() {return notes;}


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        KitchenObject  entity = (KitchenObject ) o;
        return Objects.equals(this.id, entity.id) &&
        		Objects.equals(this.kitchenName, entity.kitchenName) &&
                Objects.equals(this.shapeType, entity.shapeType) &&
                Objects.equals(this.ceilingHeight, entity.ceilingHeight) &&
                Objects.equals(this.construction1, entity.construction1) &&
                Objects.equals(this.construction2, entity.construction2) &&
                Objects.equals(this.construction3, entity.construction3) &&
                Objects.equals(this.notes, entity.notes);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, kitchenName, shapeType, ceilingHeight,
                construction1, construction2, construction3, notes);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "(" +
        		"id = " + id + ", " +
                "kitchenName = " + kitchenName + ", " +
                "shapeType = " + shapeType + ", " +
                "ceilingHeight = " + ceilingHeight + ", " +
                "construction1 = " + construction1 + ", " +
                "construction2 = " + construction2 + ", " +
                "construction3 = " + construction3 + ", " +
                "notes = " + notes + ")";
    }
}