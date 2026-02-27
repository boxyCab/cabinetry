package com.boxy.cabinet_design.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Objects;

@Entity
@Table(name = "cabinets")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cabinet implements ObjectsComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

//    public Cabinet(Integer id) {
//        this.id = id;
//    }    public Cabinet(Integer id) {
//        this.id = id;
//    }

    @Column(name = "height", nullable = false)
    private Float height;

    @Column(name = "deleteflag", nullable = false)
    private Integer deleteflag = 0;;

    @Column(name = "construction", length = 10)
    private String construction;

    @Column(name = "corner_key", length = 30)
    private String cornerKey;

    @Column(name = "rotation")
    private Float rotation;

    public Cabinet(Integer id, Float height, Float length, String name, Float width, float ceilingHeight, Integer kitchenid, Integer wallid, String cabinettype, String type, Instant createdAt, Instant updatedAt, Float startposition, Integer depth, String leftobject, String rightobject, String cornerKey, Float rotation) {
        this.id = id;
        this.height = height;
        this.length = length;
        this.name = name;
        this.width = width;
        this.ceilingHeight = ceilingHeight;
        this.kitchenId = kitchenid;
        this.wallid = wallid;
        this.cabinettype = cabinettype;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.startposition = startposition;
        this.depth = depth;
        this.leftobject = leftobject;
        this.rightobject = rightobject;
        this.cornerKey = cornerKey;
        this.rotation = rotation;
    }
    public Cabinet(Integer id, Float height, Float length, String name, Float width, float ceilingHeight, Integer kitchenid, Integer wallid, String cabinettype, String type, Instant createdAt, Instant updatedAt, Float startposition, Integer depth, String leftobject, String rightobject, String cornerKey, Float rotation, String construction) {
        this.id = id;
        this.height = height;
        this.length = length;
        this.name = name;
        this.width = width;
        this.ceilingHeight = ceilingHeight;
        this.kitchenId = kitchenid;
        this.wallid = wallid;
        this.cabinettype = cabinettype;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.startposition = startposition;
        this.depth = depth;
        this.leftobject = leftobject;
        this.rightobject = rightobject;
        this.cornerKey = cornerKey;
        this.rotation = rotation;
        this.construction = construction;
    }

    @Column(name = "length")
    private Float length;

    @Column(name = "name")
    private String name;

    @Column(name = "width", nullable = false)
    private Float width;

    @Column(name = "ceiling_height")
    private float ceilingHeight;

    @Column(name = "kitchenid", nullable = false)
    private Integer kitchenId;

    public Cabinet() {
    }

    @Column(name = "wallid", nullable = false)
    private Integer wallid;

    @Column(name = "cabinettype", nullable = false, length = 50)
    private String cabinettype;

    @Column(name = "type", length = 20)
    private String type;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    
    // 在保存之前，如果createdAt为空，则设置为当前时间
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            // 获取当前 UTC 时间
            Instant instant = Instant.now();

            // 获取操作系统的默认时区
            ZoneId systemZone = ZoneId.systemDefault();

            // 将 UTC 时间转换为操作系统时区的时间
            ZonedDateTime localDateTime = instant.atZone(systemZone);

            // 将操作系统时区的时间转换回 Instant 类型，并赋值给 createdAt
            createdAt = localDateTime.toInstant();
        }
        if (updatedAt == null) {
            // 获取当前 UTC 时间
            Instant instant = Instant.now();

            // 获取操作系统的默认时区
            ZoneId systemZone = ZoneId.systemDefault();

            // 将 UTC 时间转换为操作系统时区的时间
            ZonedDateTime localDateTime = instant.atZone(systemZone);

            // 将操作系统时区的时间转换回 Instant 类型，并赋值给 createdAt
            updatedAt = localDateTime.toInstant();
        }
    }
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "startposition")
    private Float startposition;

    @Column(name = "depth")
    private Integer depth;

    @Column(name = "leftobject", length = 20)
    private String leftobject;

    @Column(name = "rightobject", length = 20)
    private String rightobject;
    
    @Column(name = "adjustotherwall")
    private boolean adjustotherwall;
    
    @Column(name = "peninsulainercorner")
    private Integer peninsulainercorner;
    // 1: max 2 :min
  
    public void setRotation(Float rotation) {
        this.rotation = rotation;
    }

    public Float getRotation() {
        return rotation;
    }

    public String getCornerKey() {
        return cornerKey;
    }

    public void setCornerKey(String cornerKey) {
        this.cornerKey = cornerKey;
    }

    public String getConstruction() {
        return construction;
    }

    public void setConstruction(String construction) {
        this.construction = construction;
    }

    public Integer getDeleteflag() {
        return deleteflag;
    }

    public void setDeleteflag(Integer deleteflag) {
        this.deleteflag = deleteflag;
    }

    public String getRightobject() {
        return rightobject;
    }

    public void setRightobject(String rightobject) {
        this.rightobject = rightobject;
    }

    public String getLeftobject() {
        return leftobject;
    }

    public void setLeftobject(String leftobject) {
        this.leftobject = leftobject;
    }

    public Integer getDepth() {
        return depth;
    }

    public void setDepth(Integer depth) {
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

    public Float getLength() {
        return length;
    }

    public void setLength(Float length) {
        this.length = length;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public Float getWidth() {
        return width;
    }
    @Override
    public void setWidth(Float width) {
        this.width = width;
    }

    public float getCeilingHeight() {
        return ceilingHeight;
    }

    public void setCeilingHeight(float ceilingHeight) {
        this.ceilingHeight = ceilingHeight;
    }

    public Integer getKitchenId() {
        return kitchenId;
    }

    public void setKitchenId(Integer kitchenId) {
        this.kitchenId = kitchenId;
    }

    public Integer getWallid() {
        return wallid;
    }

    public void setWallid(Integer wallid) {
        this.wallid = wallid;
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
    // 拷贝构造函数
    public Cabinet(Cabinet other) {
        this.id = other.id;
        this.height = other.height;
        this.length = other.length;
        this.name = other.name;
        this.width = other.width;
        this.ceilingHeight = other.ceilingHeight;
        this.kitchenId = other.kitchenId;
        this.wallid = other.wallid;
        this.cabinettype = other.cabinettype;
        this.type = other.type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.startposition = other.startposition;
        this.depth = other.depth;
        this.leftobject = other.leftobject;
        this.rightobject = other.rightobject;
        this.rotation = other.rotation;
        this.cornerKey = other.cornerKey;
        this.construction = other.construction;
        this.deleteflag = other.deleteflag;
        this.peninsulainercorner = other.peninsulainercorner;




    }
    public Cabinet( Float height, Float length, String name, Float width, float ceilingHeight, Integer kitchenid, Integer wallid, String cabinettype, String type,  Float startposition, Integer depth, float rotation, String leftobject,String rightobject) {
        this.height = height;
        this.length = length;
        this.name = name;
        this.width = width;
        this.ceilingHeight = ceilingHeight;
        this.kitchenId = kitchenid;
        this.wallid = wallid;
        this.cabinettype = cabinettype;
        this.type = type;
        this.startposition = startposition;
        this.depth = depth;
        this.rotation = rotation;
        this.leftobject = leftobject;
        this.rightobject = rightobject;
        

    }
    public Cabinet( Float height, Float length, String name, Float width, float ceilingHeight, Integer kitchenid, Integer wallid, String cabinettype, String type,  Float startposition, Integer depth, String cornerKey, float rotation, String leftobject,String rightobject , boolean adjustotherwall) {
        this.height = height;
        this.length = length;
        this.name = name;
        this.width = width;
        this.ceilingHeight = ceilingHeight;
        this.kitchenId = kitchenid;
        this.wallid = wallid;
        this.cabinettype = cabinettype;
        this.type = type;
        this.startposition = startposition;
        this.depth = depth;
        this.cornerKey = cornerKey;
        this.rotation = rotation;
        this.leftobject = leftobject;
        this.rightobject = rightobject;
        this.adjustotherwall = adjustotherwall;

    }
    public Cabinet( Float height, Float length, String name, Float width, float ceilingHeight, Integer kitchenid, Integer wallid, String cabinettype, String type,  Float startposition, Integer depth, String leftobject,String rightobject, float rotation) {
        this.height = height;
        this.length = length;
        this.name = name;
        this.width = width;
        this.ceilingHeight = ceilingHeight;
        this.kitchenId = kitchenid;
        this.wallid = wallid;
        this.cabinettype = cabinettype;
        this.type = type;
        this.startposition = startposition;
        this.depth = depth;
        this.leftobject = leftobject;
        this.rightobject = rightobject;
        this.rotation = rotation;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cabinet cabinet = (Cabinet) o;
        return Objects.equals(id, cabinet.id) && Objects.equals(height, cabinet.height) && Objects.equals(length, cabinet.length) && Objects.equals(name, cabinet.name) && Objects.equals(width, cabinet.width) && Objects.equals(ceilingHeight, cabinet.ceilingHeight) && Objects.equals(kitchenId, cabinet.kitchenId) && Objects.equals(wallid, cabinet.wallid) && Objects.equals(cabinettype, cabinet.cabinettype) && Objects.equals(type, cabinet.type) && Objects.equals(startposition, cabinet.startposition);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, height, length, name, width, ceilingHeight, kitchenId, wallid, cabinettype, type, startposition);
    }

    @Override
    public String toString() {
        return "Cabinet{" +
                "id=" + id +
                ", height=" + height +
                ", length=" + length +
                ", name='" + name + '\'' +
                ", width=" + width +
                ", ceilingHeight=" + ceilingHeight +
                ", kitchenid=" + kitchenId +
                ", wallid=" + wallid +
                ", cabinettype='" + cabinettype + '\'' +
                ", type='" + type + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", startposition=" + startposition +
                '}';
    }
    @Override
    public Float getStartposition() {
        return startposition;
    }

    @Override
    public void setStartposition(Float startposition) {
        this.startposition = startposition;
    }
    
    @Override
    public boolean getAdjustotherwall() {
        return adjustotherwall;
    }

    @Override
    public void setAdjustotherwall(boolean adjustotherwall) {
        this.adjustotherwall = adjustotherwall;
    }
    
    public Integer getPeninsulainercorner() {
        return peninsulainercorner;
    }

    public void setPeninsulainercorner(Integer peninsulainercorner) {
        this.peninsulainercorner = peninsulainercorner;
    }



}