package com.boxy.cabinet_design.dto;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor

public class PdfMergeRequest {
    private String directoryPath;
    private Integer kitchenId;

    // getters and setters
    public String getDirectoryPath() {
        return directoryPath;
    }

    public void setDirectoryPath(String directoryPath) {
        this.directoryPath = directoryPath;
    }

    public Integer getKitchenId() {
        return kitchenId;
    }

    public void setKitchenId(Integer kitchenId) {
        this.kitchenId = kitchenId;
    }
}
