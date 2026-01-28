package com.boxy.cabinet_design.entity;

import java.time.Instant;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
@Table(name = "peninisula_connections")
public class PeninisulaConnection {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "wall_id", nullable = false)
    private Wall wall;
  
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "adjacent_peninisula_id", nullable = false)
    private Island adjacentPeninisulaId;
    
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

    public PeninisulaConnection() {
    }

    public PeninisulaConnection(Kitchen kitchen, Wall wall, Island adjacentPeninisulaId, boolean isLowerCabinetConnected, boolean isUpperCabinetConnected) {
        this.kitchen = kitchen;
        this.wall = wall;
       this.adjacentPeninisulaId = adjacentPeninisulaId;
       this.isLowerCabinetConnected = isLowerCabinetConnected;
       this.isUpperCabinetConnected = isUpperCabinetConnected;
    }
   
    public Integer getId() {
        return this.id;
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

    public Island getAdjacentPeninisulaId() {
        return this.adjacentPeninisulaId;
    }
    
    public void setAdjacentPeninisulaId(Island adjacentPeninisulaId) {
        this.adjacentPeninisulaId = adjacentPeninisulaId;
    }
    public boolean isIsLowerCabinetConnected() {
        return this.isLowerCabinetConnected;
    }
    
    public void setIsLowerCabinetConnected(boolean isLowerCabinetConnected) {
        this.isLowerCabinetConnected = isLowerCabinetConnected;
    }
    public boolean isIsUpperCabinetConnected() {
        return this.isUpperCabinetConnected;
    }
    
    public void setIsUpperCabinetConnected(boolean isUpperCabinetConnected) {
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


