package com.boxy.cabinet_design.entity;

import jakarta.persistence.*;
import jakarta.persistence.Id;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "walls")
public class Wall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Wall wall = (Wall) o;
        return Objects.equals(id, wall.id) && Objects.equals(kitchen, wall.kitchen) && Objects.equals(width, wall.width) && Objects.equals(height, wall.height) && Objects.equals(angle, wall.angle) && Objects.equals(position, wall.position) && Objects.equals(otherWallId1, wall.otherWallId1) && Objects.equals(otherWallId2, wall.otherWallId2) && Objects.equals(otherWallId3, wall.otherWallId3) && Objects.equals(wallName, wall.wallName) && Objects.equals(isLowerCabinetPlaced, wall.isLowerCabinetPlaced) && Objects.equals(isUpperCabinetPlaced, wall.isUpperCabinetPlaced);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, kitchen, width, height, angle, position, otherWallId1, otherWallId2, otherWallId3, wallName, isLowerCabinetPlaced, isUpperCabinetPlaced);
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;

    @Column(name = "width")
    private Float width;

    @Column(name = "height")
    private Float height;

    @Column(name = "angle")
    private Float angle;

    @Column(name = "position")
    private String position;

    @Column(name = "other_wall_id1")
    private Integer otherWallId1;

    @Column(name = "other_wall_id2")
    private Integer otherWallId2;

    @Column(name = "other_wall_id3")
    private Integer otherWallId3;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "wallname", nullable = false, length = 45)
    private String wallName;

    @Column(name = "is_lower_cabinet_placed", nullable = false)
    private Boolean isLowerCabinetPlaced = false;

    @Column(name = "is_upper_cabinet_placed", nullable = false)
    private Boolean isUpperCabinetPlaced = false;

    @Column(name = "pantry_required")
    private Boolean pantryRequired = false;
    
    @Column(name = "left_corner", nullable = false)
    private Boolean leftCorner = false;

    @Column(name = "right_corner", nullable = false)
    private Boolean rightCorner = false;
    
    
    
    
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

    public Float getAngle() {
        return angle;
    }

    public void setAngle(Float angle) {
        this.angle = angle;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public Integer getOtherWallId1() {
        return otherWallId1;
    }

    public void setOtherWallId1(Integer otherWallId1) {
        this.otherWallId1 = otherWallId1;
    }

    public Integer getOtherWallId2() {
        return otherWallId2;
    }

    public void setOtherWallId2(Integer otherWallId2) {
        this.otherWallId2 = otherWallId2;
    }

    public Integer getOtherWallId3() {
        return otherWallId3;
    }

    public void setOtherWallId3(Integer otherWallId3) {
        this.otherWallId3 = otherWallId3;
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

    public String getWallName() {
        return wallName;
    }

    public void setWallName(String wallName) {
        this.wallName = wallName;
    }

    public Boolean getIsLowerCabinetPlaced() {
        return isLowerCabinetPlaced;
    }

    public void setIsLowerCabinetPlaced(Boolean isLowerCabinetPlaced) {
        this.isLowerCabinetPlaced = isLowerCabinetPlaced;
    }

    public Boolean getIsUpperCabinetPlaced() {
        return isUpperCabinetPlaced;
    }

    public void setIsUpperCabinetPlaced(Boolean isUpperCabinetPlaced) {
        this.isUpperCabinetPlaced = isUpperCabinetPlaced;
    }
    
    public Boolean getPantryRequired() {
        return pantryRequired;
    }

    public void setPantryRequired(Boolean pantryRequired) {
        this.pantryRequired = pantryRequired;
    }
    
    public Boolean getLeftCorner() {
        return leftCorner;
    }

    public void setLeftCorner(Boolean leftCorner) {
        this.leftCorner = leftCorner;
    }

    public Boolean getRightCorner() {
        return rightCorner;
    }

    public void setRightCorner(Boolean rightCorner) {
        this.rightCorner = rightCorner;
    }
}