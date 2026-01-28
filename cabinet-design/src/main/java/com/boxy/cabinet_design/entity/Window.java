package com.boxy.cabinet_design.entity;

import jakarta.persistence.Id;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "windows")
public class Window implements ObjectsComponent, ObjectsWindowDoor {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Window window = (Window) o;
        return Objects.equals(id, window.id) && Objects.equals(kitchen, window.kitchen) && Objects.equals(wall, window.wall) && Objects.equals(width, window.width) && Objects.equals(height, window.height) && Objects.equals(angle, window.angle) && Objects.equals(startposition, window.startposition) && Objects.equals(createdAt, window.createdAt) && Objects.equals(hasWindow, window.hasWindow) && Objects.equals(updatedAt, window.updatedAt) && Objects.equals(windowName, window.windowName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, kitchen, wall, width, height, angle, startposition, createdAt, hasWindow, updatedAt, windowName);
    }

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

    @Column(name = "haswindow", nullable = false)
    private Boolean hasWindow = false;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "windowname", nullable = false, length = 50)
    private String windowName;

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

    public Boolean getHasWindow() {
        return hasWindow;
    }

    public void setHasWindow(Boolean hasWindow) {
        this.hasWindow = hasWindow;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getWindowName() {
        return windowName;
    }

    public void setWindowName(String windowName) {
        this.windowName = windowName;
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