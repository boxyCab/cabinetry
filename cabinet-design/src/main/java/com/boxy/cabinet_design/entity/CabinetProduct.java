package com.boxy.cabinet_design.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Id;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "cabinetproducts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CabinetProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "depth", nullable = false)
    private Float depth;

    @Column(name = "price")
    private Float price;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CabinetProduct that = (CabinetProduct) o;
        return Objects.equals(id, that.id) && Objects.equals(height, that.height) && Objects.equals(depth, that.depth) && Objects.equals(name, that.name) && Objects.equals(width, that.width) && Objects.equals(cabinettype, that.cabinettype) && Objects.equals(type, that.type) && Objects.equals(construction, that.construction);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, height, depth, name, width, cabinettype, type, construction);
    }

    @Override
    public String toString() {
        return "Cabinetproduct{" +
                "id=" + id +
                ", height=" + height +
                ", depth=" + depth +
                ", name='" + name + '\'' +
                ", width=" + width +
                ", cabinettype='" + cabinettype + '\'' +
                ", type='" + type + '\'' +
                ", construction='" + construction + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }

    @Column(name = "height", nullable = false)
    private Float height;


    @Column(name = "name")
    private String name;

    @Column(name = "width", nullable = false)
    private Float width;

    @Column(name = "cabinettype", nullable = false, length = 50)
    private String cabinettype;

    @Column(name = "type", length = 10)
    private String type;

    @Column(name = "construction", length = 10)
    private String construction;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Float getPrice() {
        return price;
    }

    public void setPrice(Float price) {
        this.price = price;
    }

    public Float getDepth() {
        return depth;
    }

    public void setDepth(Float depth) {
        this.depth = depth;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Float getHeight() {
        return height;
    }

    public void setHeight(Float height) {
        this.height = height;
    }



    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Float getWidth() {
        return width;
    }

    public void setWidth(Float width) {
        this.width = width;
    }

    public String getCabinettype() {
        return cabinettype;
    }

    public void setCabinettype(String cabinettype) {
        this.cabinettype = cabinettype;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getConstruction() {
        return construction;
    }

    public void setConstruction(String construction) {
        this.construction = construction;
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