package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.Canvasobject;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CanvasobjectRepository extends JpaRepository<Canvasobject, Integer> {
    // 方法名遵循 Spring Data JPA 的命名规则，根据 kitchenId 查询所有 Canvasobject
    List<Canvasobject> findByKitchenId(Integer kitchenId);

    // 如果需要更复杂的查询，可以使用 @Query 注解
    @Query("SELECT c FROM Canvasobject c WHERE c.kitchen.id = :kitchenId")
    List<Canvasobject> findCanvasobjectsByKitchenId(@Param("kitchenId") Integer kitchenId);

    long countByKitchenId(Integer kitchenId);
    // 根据 kitchenId 删除记录
    void deleteByKitchenId(Integer kitchenId);


}