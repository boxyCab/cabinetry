package com.boxy.cabinet_design.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicUpdate;

import java.time.Instant;

@Entity
@Table(name = "kitchens")
public class Kitchen {
    @Column(name = "construction3", length = 50)
    private String construction3;

    @Column(name = "construction2", length = 50)
    private String construction2;

    @Column(name = "shapetype", nullable = false, length = 10)
    private String shapeType;

    @Column(name = "ceilingheight", nullable = false)
    private float ceilingHeight;

    @Column(name = "construction1", length = 50)
    private String construction1;

    @Column(name = "notes", length = 500)
    private String notes;

    public Kitchen() {
        // 无参构造函数，JPA 必需
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();

    }
    public Kitchen(String kitchenName, String shapeType) {
        this.kitchenName = kitchenName;
        this.shapeType = shapeType;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "kitchenname", nullable = false)
    private String kitchenName;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public String getConstruction1() {
        return construction1;
    }

    public void setConstruction1(String construction1) {
        this.construction1 = construction1;
    }

    public float getCeilingHeight() {
        return ceilingHeight;
    }

    public void setCeilingHeight(float ceilingHeight) {
        this.ceilingHeight = ceilingHeight;
    }

    public String getShapeType() {
        return shapeType;
    }

    public void setShapeType(String shapeType) {
        this.shapeType = shapeType;
    }

    public String getConstruction2() {
        return construction2;
    }

    public void setConstruction2(String construction2) {
        this.construction2 = construction2;
    }

    public String getConstruction3() {
        return construction3;
    }

    public void setConstruction3(String construction3) {
        this.construction3 = construction3;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getKitchenName() {
        return kitchenName;
    }

    public void setKitchenName(String kitchenName) {
        this.kitchenName = kitchenName;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

}