package com.boxy.cabinet_design.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class KitchenNotesDto {
    private Integer kitchenId;
    private String notes;

    @JsonCreator
    public KitchenNotesDto(
            @JsonProperty("kitchenId") Integer kitchenId,
            @JsonProperty("notes") String notes) {
        this.kitchenId = kitchenId;
        this.notes = notes;
    }
}
