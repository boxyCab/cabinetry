package com.boxy.cabinet_design.dto;

import com.boxy.cabinet_design.entity.*;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;



import lombok.Data;


@Data
public class KitchenDto implements Serializable {


    private Integer kitchenId;
    private String kitchenName;
    private Kitchen kitchen ;
    private List<Wall> wallList ;
    private Island island ;
    private List<Window> windowList ;
    private List<Door> doorList  ;
    private List<Appliance> applianceList ;

    @JsonCreator
    public KitchenDto(
            @JsonProperty("kitchenId") Integer kitchenId,
            @JsonProperty("kitchenName") String kitchenName,
            @JsonProperty("kitchen") Kitchen kitchen,
            @JsonProperty("wallList") List<Wall> wallList,
            @JsonProperty("island") Island island,
            @JsonProperty("windowList") List<Window> windowList,
            @JsonProperty("doorList") List<Door> doorList,
            @JsonProperty("applianceList") List<Appliance> applianceList) {
        this.kitchenId = kitchenId;
        this.kitchenName = kitchenName;
        this.kitchen = kitchen;
        this.wallList = wallList;
        this.island = island;
        this.windowList = windowList;
        this.doorList = doorList;
        this.applianceList = applianceList;
    }

    public KitchenDto() {
        // 必须有无参构造函数
    }

}


