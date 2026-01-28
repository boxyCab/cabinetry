package com.boxy.cabinet_design.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Id;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "cabinetsrules")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cabinetsrule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "cabinet_type", nullable = false, length = 10)
    private String cabinetType;

    @Column(name = "space_width", nullable = false)
    private Float spaceWidth;

    @Column(name = "width_cab1")
    private Float widthCab1;

    @Column(name = "width_cab2")
    private Float widthCab2;

    @Column(name = "type", length = 10)
    private String type;

    @Column(name = "construction", length = 10)
    private String construction;
    
    @Column(name = "depth_cab")
    private Float depthCab;
    
    @Column(name = "height_cab1")
    private Float heightCab1;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cabinetsrule that = (Cabinetsrule) o;
        return Objects.equals(id, that.id) && Objects.equals(cabinetType, that.cabinetType) && Objects.equals(spaceWidth, that.spaceWidth) && Objects.equals(cabinetWidth, that.cabinetWidth) && Objects.equals(returnCab1, that.returnCab1) && Objects.equals(returnCab2, that.returnCab2) && Objects.equals(priority, that.priority) && Objects.equals(data, that.data);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, cabinetType, spaceWidth, cabinetWidth, returnCab1, returnCab2, priority, data);
    }

    @Override
    public String toString() {
        return "Cabinetsrule{" +
                "id=" + id +
                ", cabinetType='" + cabinetType + '\'' +
                ", spaceWidth=" + spaceWidth +
                ", cabinetWidth=" + cabinetWidth +
                ", returnCab1='" + returnCab1 + '\'' +
                ", returnCab2='" + returnCab2 + '\'' +
                ", priority=" + priority +
                ", data='" + data + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }

    @Column(name = "cabinet_width", nullable = false)
    private Float cabinetWidth;

    @Column(name = "return_cab1", nullable = false, length = 10)
    private String returnCab1;

    @Column(name = "return_cab2", nullable = false, length = 10)
    private String returnCab2;

    @Column(name = "priority", nullable = false)
    private Integer priority;

    @Lob
    @Column(name = "data")
    private String data;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public String getConstruction() {
        return construction;
    }

    public void setConstruction(String construction) {
        this.construction = construction;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Float getWidthCab2() {
        return widthCab2;
    }

    public void setWidthCab2(Float widthCab2) {
        this.widthCab2 = widthCab2;
    }

    public Float getWidthCab1() {
        return widthCab1;
    }

    public void setWidthCab1(Float widthCab1) {
        this.widthCab1 = widthCab1;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCabinetType() {
        return cabinetType;
    }

    public void setCabinetType(String cabinetType) {
        this.cabinetType = cabinetType;
    }

    public Float getSpaceWidth() {
        return spaceWidth;
    }

    public void setSpaceWidth(Float spaceWidth) {
        this.spaceWidth = spaceWidth;
    }

    public Float getCabinetWidth() {
        return cabinetWidth;
    }

    public void setCabinetWidth(Float cabinetWidth) {
        this.cabinetWidth = cabinetWidth;
    }

    public String getReturnCab1() {
        return returnCab1;
    }

    public void setReturnCab1(String returnCab1) {
        this.returnCab1 = returnCab1;
    }

    public String getReturnCab2() {
        return returnCab2;
    }

    public void setReturnCab2(String returnCab2) {
        this.returnCab2 = returnCab2;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public String getData() {
        return data;
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
    public Float getDepthCab() {
        return depthCab;
    }

    public void setDepthCab(Float depthCab) {
        this.depthCab = depthCab;
    }
    
    public Float getHeightCab1() {
        return heightCab1;
    }

    public void setHeightCab1(Float heightCab1) {
        this.heightCab1 = heightCab1;
    }

}