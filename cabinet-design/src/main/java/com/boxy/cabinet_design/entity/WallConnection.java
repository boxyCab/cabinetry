package com.boxy.cabinet_design.entity;

import jakarta.persistence.Id;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.proxy.HibernateProxy;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "wall_connections")
public class WallConnection {
    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        WallConnection that = (WallConnection) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;

    public WallConnection() {

    }

    public Boolean getLowerCabinetConnected() {
        return isLowerCabinetConnected;
    }

    public void setLowerCabinetConnected(Boolean lowerCabinetConnected) {
        isLowerCabinetConnected = lowerCabinetConnected;
    }

    public Boolean getUpperCabinetConnected() {
        return isUpperCabinetConnected;
    }

    public void setUpperCabinetConnected(Boolean upperCabinetConnected) {
        isUpperCabinetConnected = upperCabinetConnected;
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "wall_id", nullable = false)
    private Wall wall;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "adjacent_wall_id", nullable = false)
    private Wall adjacentWall;

    @Column(name = "is_lower_cabinet_connected", nullable = false)
    private Boolean isLowerCabinetConnected = false;

    @Column(name = "is_upper_cabinet_connected", nullable = false)
    private Boolean isUpperCabinetConnected = false;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

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

    public WallConnection(Kitchen kitchen, Wall wall, Wall adjacentWall, Boolean isLowerCabinetConnected, Boolean isUpperCabinetConnected) {
        this.kitchen = kitchen;
        this.wall = wall;
        this.adjacentWall = adjacentWall;
        this.isLowerCabinetConnected = isLowerCabinetConnected;
        this.isUpperCabinetConnected = isUpperCabinetConnected;
    }

    @Override
    public String toString() {
        return "WallConnection{" +
                "isUpperCabinetConnected=" + isUpperCabinetConnected +
                ", isLowerCabinetConnected=" + isLowerCabinetConnected +
                ", adjacentWall=" + adjacentWall +
                ", wall=" + wall +
                ", kitchen=" + kitchen +
                ", id=" + id +
                ", updatedAt=" + updatedAt +
                ", createdAt=" + createdAt +
                '}';
    }

    public void setWall(Wall wall) {
        this.wall = wall;
    }

    public Wall getAdjacentWall() {
        return adjacentWall;
    }

    public void setAdjacentWall(Wall adjacentWall) {
        this.adjacentWall = adjacentWall;
    }

    public Boolean getIsLowerCabinetConnected() {
        return isLowerCabinetConnected;
    }

    public void setIsLowerCabinetConnected(Boolean isLowerCabinetConnected) {
        this.isLowerCabinetConnected = isLowerCabinetConnected;
    }

    public Boolean getIsUpperCabinetConnected() {
        return isUpperCabinetConnected;
    }

    public void setIsUpperCabinetConnected(Boolean isUpperCabinetConnected) {
        this.isUpperCabinetConnected = isUpperCabinetConnected;
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

}