package com.boxy.cabinet_design.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Id;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "canvasobjects")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Canvasobject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;

    @Column(name = "object_type", nullable = false, length = 50)
    private String objectType;

    @Column(name = "x", nullable = false)
    private Float x;

    @Column(name = "y", nullable = false)
    private Float y;

    @Column(name = "width", nullable = false)
    private Float width;

    @Column(name = "height", nullable = false)
    private Float height;

    @Column(name = "rotation", nullable = false)
    private Float rotation;

    @Column(name = "color", nullable = false, length = 20)
    private String color;

    @Lob
    @Column(name = "data")
    private String data;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;


    @Column(name = "wall_id")
    private Integer wallid;

    @Column(name = "related_id")
    private Integer relatedId;

    @Column(name = "update_flg", nullable = false)
    private Integer updateFlg = 0;

    @Column(name = "related_id2")
    private Integer relatedId2;
    
    @Column(name = "widthcabinet")
    private Float widthcabinet;

    @Column(name = "heightcabinet")
    private Float heightcabinet;

    @Column(name = "depthcabinet")
    private Float depthcabinet;

    public Canvasobject(Integer id, Kitchen kitchen, String objectType, Float x, Float y, Float width, Float height, Float rotation, String color, String data, Instant createdAt, Instant updatedAt, Integer wallid, Integer relatedId, String objectname, Float scale, String cabinettype, Float depth, Float endX, Float endY, Float widthcabinet, Float heightcabinet, Float depthcabinet) {
        this.id = id;
        this.kitchen = kitchen;
        this.objectType = objectType;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.color = color;
        this.data = data;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.wallid = wallid;
        this.relatedId = relatedId;
        this.objectname = objectname;
        this.scale = scale;
        this.cabinettype = cabinettype;
        this.depth = depth;
        this.endX = endX;
        this.endY = endY;
        this.widthcabinet = widthcabinet;
        this.heightcabinet = heightcabinet;
        this.depthcabinet = depthcabinet;
    }

    @Column(name = "objectname", length = 50)
    private String objectname;

    @Column(name = "scale")
    private Float scale = 1f;

    @Column(name = "cabinettype", length = 20)
    private String cabinettype;

    @Column(name = "depth")
    private Float depth;

    @Column(name = "end_x")
    private Float endX;

    @Column(name = "end_y")
    private Float endY;

    public Integer getRelatedId2() {
        return relatedId2;
    }

    public void setRelatedId2(Integer relatedId2) {
        this.relatedId2 = relatedId2;
    }

    public Integer getUpdateFlg() {
        return updateFlg;
    }

    public void setUpdateFlg(Integer updateFlg) {
        this.updateFlg = updateFlg;
    }

    public Canvasobject() {

    }
    
    public Float getWidthcabinet() {
        return widthcabinet;
    }

    public void setWidthcabinet(Float widthcabinet) {
        this.widthcabinet = widthcabinet;
    }

    public Float getHeightcabinet() {
        return heightcabinet;
    }

    public void setHeightcabinet(Float heightcabinet) {
        this.heightcabinet = heightcabinet;
    }

    public Float getDepthcabinet() {
        return depthcabinet;
    }

    public void setDepthcabinet(Float depthcabinet) {
        this.depthcabinet = depthcabinet;
    }

    public Float getEndY() {
        return endY;
    }

    public void setEndY(Float endY) {
        this.endY = endY;
    }

    public Float getEndX() {
        return endX;
    }

    public void setEndX(Float endX) {
        this.endX = endX;
    }

    public Float getDepth() {
        return depth;
    }

    public void setDepth(Float depth) {
        this.depth = depth;
    }

    public String getCabinettype() {
        return cabinettype;
    }

    public void setCabinettype(String cabinettype) {
        this.cabinettype = cabinettype;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Kitchen getKitchen() {
        return kitchen;
    }

    public void setKitchen(Kitchen kitchen) {
        this.kitchen = kitchen;
    }

    public String getObjectType() {
        return objectType;
    }

    public void setObjectType(String objectType) {
        this.objectType = objectType;
    }

    public Float getX() {
        return x;
    }

    public void setX(Float x) {
        this.x = x;
    }

    public Float getY() {
        return y;
    }

    public void setY(Float y) {
        this.y = y;
    }

    public Float getWidth() {
        return width;
    }

    public void setWidth(Float width) {
        this.width = width;
    }

    public Float getHeight() {
        return height;
    }

    public void setHeight(Float height) {
        this.height = height;
    }

    public Float getRotation() {
        return rotation;
    }

    public void setRotation(Float rotation) {
        this.rotation = rotation;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getData() {
        return data;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Canvasobject that = (Canvasobject) o;
        return Objects.equals(id, that.id) && Objects.equals(kitchen, that.kitchen) && Objects.equals(objectType, that.objectType) && Objects.equals(x, that.x) && Objects.equals(y, that.y) && Objects.equals(width, that.width) && Objects.equals(height, that.height) && Objects.equals(rotation, that.rotation) && Objects.equals(color, that.color) && Objects.equals(data, that.data) && Objects.equals(wallid, that.wallid) && Objects.equals(relatedId, that.relatedId) && Objects.equals(objectname, that.objectname) && Objects.equals(scale, that.scale);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, kitchen, objectType, x, y, width, height, rotation, color, data, wallid, relatedId, objectname, scale);
    }

    @Override
    public String toString() {
        return "Canvasobject{" +
                "id=" + id +
                ", kitchen=" + kitchen +
                ", objectType='" + objectType + '\'' +
                ", x=" + x +
                ", y=" + y +
                ", width=" + width +
                ", height=" + height +
                ", rotation=" + rotation +
                ", color='" + color + '\'' +
                ", data='" + data + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", wallid=" + wallid +
                ", relatedId=" + relatedId +
                ", objectname='" + objectname + '\'' +
                ", scale=" + scale +
                '}';
    }

    public void setData(String data) {
        this.data = data;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getWallid() {
        return wallid;
    }

    public void setWallid(Integer wallid) {
        this.wallid = wallid;
    }

    public Integer getRelatedId() {
        return relatedId;
    }

    public void setRelatedId(Integer relatedId) {
        this.relatedId = relatedId;
    }

    public String getObjectname() {
        return objectname;
    }

    public void setObjectname(String objectname) {
        this.objectname = objectname;
    }

    public Float getScale() {
        return scale;
    }

    public void setScale(Float scale) {
        this.scale = scale;
    }

}