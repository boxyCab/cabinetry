package com.boxy.cabinet_design.entity;

import jakarta.persistence.*;
import jakarta.persistence.Id;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Entity
@Table(name = "doors")
public class Door implements ObjectsComponent, ObjectsWindowDoor  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wall_id", nullable = false)
    private Wall wall;

    @Column(name = "width")
    private Float width;

    @Column(name = "height")
    private Float height;

    @Column(name = "angle")
    private Float angle;

    @Column(name = "startposition")
    private Float startposition;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "doorname", nullable = false, length = 50)
    private String doorName;

    @Column(name = "hasdoor", nullable = false)
    private Boolean hasDoor;

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

    public Wall getWall() {
        return wall;
    }

    public void setWall(Wall wall) {
        this.wall = wall;
    }

    @Override
    public Float getWidth() {
        return width;
    }

    @Override
    public void setWidth(Float width) {
        this.width = width;
    }

    @Override
    public Float getHeight() {
        return height;
    }

    @Override
    public void setHeight(Float height) {
        this.height = height;
    }


    public Float getAngle() {
        return angle;
    }

    public void setAngle(Float angle) {
        this.angle = angle;
    }

    @Override
    public Float getStartposition() {
        return startposition;
    }

    @Override
    public void setStartposition(Float startposition) {
        this.startposition = startposition;
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

    public String getDoorName() {
        return doorName;
    }

    public void setDoorName(String doorName) {
        this.doorName = doorName;
    }

    public Boolean getHasDoor() {
        return hasDoor;
    }

    public void setHasDoor(Boolean hasDoor) {
        this.hasDoor = hasDoor;
    }

	@Override
	public boolean getAdjustotherwall() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void setAdjustotherwall(boolean adjustotherwall) {
		// TODO Auto-generated method stub
		
	}
}
