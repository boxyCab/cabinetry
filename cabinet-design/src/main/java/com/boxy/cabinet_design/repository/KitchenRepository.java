package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.Kitchen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface KitchenRepository extends JpaRepository<Kitchen, Integer > {
    Optional<Kitchen> findById(Integer kitchenId);

    // 模糊查询 kitchenName
    @Query("SELECT k FROM Kitchen k WHERE k.kitchenName LIKE %:searchData%")
    List<Kitchen> findByKitchenNameLike(@Param("searchData") String searchData);

}