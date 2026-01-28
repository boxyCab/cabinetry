package com.boxy.cabinet_design.entity;

import jakarta.persistence.*;
import jakarta.persistence.Id;

import java.time.Instant;

@Entity(name = "IslandEntity") // 指定唯一的实体名称
@Table(name = "island")
public class Island {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;

    @Column(name = "created_At")
    private Instant createdAt;

    @Column(name = "island_kind", nullable = false, length = 50)
    private String islandKind;
    
    @Column(name = "isoverhang", nullable = false)
    private Boolean isOverhang;
    
    @Column(name = "iswaterfall", nullable = false)
    private Boolean isWaterfall;
    
    @Column(name = "horvertype", length = 10)
    private String horverType;

    public Boolean getIsOverhang() {
		return isOverhang;
	}

	public void setIsOverhang(Boolean isOverhang) {
		this.isOverhang = isOverhang;
	}
	
    public Boolean getIsWaterfall() {
		return isWaterfall;
	}

	public void setIsWaterfall(Boolean isWaterfall) {
		this.isWaterfall = isWaterfall;
	}


	public String getHorverType() {
		return horverType;
	}

	public void setHorverType(String horverType) {
		this.horverType = horverType;
	}

	@Column(name = "width")
    private float width;

    @Column(name = "peninsulaisadjacentto", length = 10)
    private String peninsulaisadjacentto;

    @Column(name = "length")
    private Integer length;

    @Column(name = "updated_At")
    private Instant updatedAt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getIslandKind() {
        return islandKind;
    }

    public void setIslandKind(String islandKind) {
        this.islandKind = islandKind;
    }

    public float getWidth() {
        return width;
    }

    public void setWidth(float width) {
        this.width = width;
    }

    public Kitchen getKitchen() {
        return kitchen;
    }

    public void setKitchen(Kitchen kitchen) {
        this.kitchen = kitchen;
    }

    public String getPeninsulaisadjacentto() {
        return peninsulaisadjacentto;
    }

    public void setPeninsulaisadjacentto(String peninsulaisadjacentto) {
        this.peninsulaisadjacentto = peninsulaisadjacentto;
    }

    public Integer getLength() {
        return length;
    }

    public void setLength(Integer length) {
        this.length = length;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Island{" +
                "id=" + id +
                ", kitchen=" + kitchen +
                ", createdAt=" + createdAt +
                ", islandKind='" + islandKind + '\'' +
                ", width=" + width +
                ", peninsulaisadjacentto='" + peninsulaisadjacentto + '\'' +
                ", length=" + length +
                ", updatedAt=" + updatedAt +
                '}';
    }
}