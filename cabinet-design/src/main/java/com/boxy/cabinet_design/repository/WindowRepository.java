package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.Window;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WindowRepository extends JpaRepository<Window, Integer> {
    List<Window> findAllByKitchenId(long kitchenId);

    @Modifying
    @Query("DELETE FROM Window w WHERE w.kitchen.id = :kitchenId")
    void deleteByKitchenId(@Param("kitchenId") Integer kitchenId);

    @Modifying
    @Query("DELETE FROM Window w WHERE w.kitchen.id = :kitchenId AND w.id NOT IN :idsToKeep")
    void deleteByKitchenIdAndIdNotIn(@Param("kitchenId") Integer kitchenId, @Param("idsToKeep") List<Integer> idsToKeep);
}