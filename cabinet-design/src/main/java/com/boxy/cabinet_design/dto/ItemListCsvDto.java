package com.boxy.cabinet_design.dto;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;


@Data
// 删除@NoArgsConstructor注解因为已经有了一个无参构造函数
public class ItemListCsvDto {

        private String id;
        private String po;
        private String customer;
        private String cabName;
        private String seriesColor;
        private String seriesCode;
        private Long quantity;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    public String getPo() {
        return po;
    }

    public void setPo(String po) {
        this.po = po;
    }
    
    public String getCustomer() {
        return customer;
    }
    public void setCustomer(String customer) {
    	this.customer = customer;
    }
    
    public String getSeriesColor() {
        return seriesColor;
    }
    public void setSeriesColor(String seriesColor) {
    	this.seriesColor = seriesColor;
    }

    public String getSeriesCode() {
        return seriesCode;
    }
    public void setSeriesCode(String seriesCode) {
    	this.seriesCode = seriesCode;
    }
    
    public Long getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Long quantity) {
    	this.quantity = quantity;
    }
    
// 添加一个与查询匹配的构造函数
    public ItemListCsvDto(String id, String po, String customer, String cabName, String seriesColor, String seriesCode, Long quantity) {
        this.id = id;
        this.po = po;
        this.customer = customer; // 或其他默认值
        this.cabName = cabName;
        this.seriesColor = seriesColor;
        this.seriesCode = seriesCode;
        this.quantity = quantity;
    }


    public ItemListCsvDto() {
    }


}
