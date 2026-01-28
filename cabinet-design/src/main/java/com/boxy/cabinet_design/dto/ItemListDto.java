package com.boxy.cabinet_design.dto;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;


@Data
// 删除@NoArgsConstructor注解因为已经有了一个无参构造函数
public class ItemListDto {

        private String id;
        private String name;
        private String manufcode;
        private String catalog;
        private Long qty;
        private float price;
        private float sum;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    public float getPrice() {
        return price;
    }

    public String getManufcode() {
        return manufcode;
    }
// 添加一个与查询匹配的构造函数
    public ItemListDto(String name, String construction, Long count, float price, float sum) {
        this.name = name;
        this.manufcode = construction;
        this.catalog = null; // 或其他默认值
        this.qty = count;
        this.price = price;
        this.sum = sum;
    }
    // 使用 @JsonCreator 和 @JsonProperty 正确标注构造函数
    @JsonCreator
    public ItemListDto(
            @JsonProperty("id") String id,
            @JsonProperty("name") String name,
            @JsonProperty("manufcode") String manufcode, 
            @JsonProperty("catalog") String catalog, 
            @JsonProperty("qty") Long qty, 
            @JsonProperty("price") float price, 
            @JsonProperty("sum") float sum) {
        this.id = id;
        this.name = name;
        this.manufcode = manufcode;
        this.catalog = catalog;
        this.qty = qty;
        this.price = price;
        this.sum = sum;
    }

    public void setManufcode(String manufcode) {
        this.manufcode = manufcode;
    }

    public String getCatalog() {
        return catalog;
    }

    public void setCatalog(String catalog) {
        this.catalog = catalog;
    }

    public Long getQty() {
        return qty;
    }

    public void setQty(Long qty) {
        this.qty = qty;
    }

    public float getSum() {
        return sum;
    }

    public void setSum(float sum) {
        this.sum = sum;
    }

    public void setPrice(float price) {
        this.price = price;
    }



    public ItemListDto() {
    }







}
