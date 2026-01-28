package com.boxy.cabinet_design.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
@JsonIgnoreProperties(ignoreUnknown = true)
public class CanvasObject {
    public String getStroke() {
        return stroke;
    }

    public void setStroke(String stroke) {
        this.stroke = stroke;
    }

    public String getX1() {
        return x1;
    }

    public void setX1(String x1) {
        this.x1 = x1;
    }

    public String getY1() {
        return y1;
    }

    public void setY1(String y1) {
        this.y1 = y1;
    }

    public String getX2() {
        return x2;
    }

    public void setX2(String x2) {
        this.x2 = x2;
    }

    public String getY2() {
        return y2;
    }

    public void setY2(String y2) {
        this.y2 = y2;
    }

    public String getFill() {
        return fill;
    }

    public void setFill(String fill) {
        this.fill = fill;
    }

    public List getPath() {
        return path;
    }

    public void setPath(List path) {
        this.path = path;
    }

    public List<CanvasObject> getObjects() {
        return objects;
    }

    public void setObjects(List<CanvasObject> objects) {
        this.objects = objects;
    }

    private String type;  // "rect", "text", "image"
    private float left;
    private float top;
    private float width;
    private float height;
    private String text;  // 仅文本对象使用
    private String imageData;  // 图像的字节数据或路径（可根据需要调整）
    private String stroke; //颜色
    private String x1;
    private String y1;
    private String x2;
    private String y2;
    private String fill;
    private List path;
    private float widthcabinet;
    private List<CanvasObject> objects;
    // getters and setters
    
    public float getWidthcabinet() {
        return widthcabinet;
    }

    public void setWidthcabinet(float widthcabinet) {
        this.widthcabinet = widthcabinet;
    }
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public float getLeft() {
        return left;
    }

    public void setLeft(float left) {
        this.left = left;
    }

    public float getTop() {
        return top;
    }

    public void setTop(float top) {
        this.top = top;
    }

    public float getWidth() {
        return width;
    }

    public void setWidth(float width) {
        this.width = width;
    }

    public float getHeight() {
        return height;
    }

    public void setHeight(float height) {
        this.height = height;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }
}
