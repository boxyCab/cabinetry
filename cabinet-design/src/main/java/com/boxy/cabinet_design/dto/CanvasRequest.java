package com.boxy.cabinet_design.dto;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class CanvasRequest {
    private String pageIndex;
    private String canvasData;
    private String path;
//    private CanvasData  canvasData;

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    // getters and setters

//    public CanvasData  getCanvasData() {
//        return canvasData;

    public String getCanvasData() {
        return canvasData;
    }

    public void setCanvasData(String imageData) {
        this.canvasData = imageData;
    }
//    }
//
//    public void setCanvasData(CanvasData  canvasData) {
//        this.canvasData = canvasData;
//    }

    public String getPageIndex() {
        return pageIndex;
    }
    public void setPageIndex(String pageIndex) {
        this.pageIndex = pageIndex;
    }

}
