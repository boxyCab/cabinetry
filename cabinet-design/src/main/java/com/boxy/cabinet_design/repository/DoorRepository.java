package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.Door;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoorRepository extends JpaRepository<Door, Integer> {
    List<Door> findAllByKitchenId(Integer kitchenId);

    @Modifying
    @Query("DELETE FROM Door d WHERE d.kitchen.id = :kitchenId")
    void deleteByKitchenId(@Param("kitchenId") Integer kitchenId);

    @Modifying
    @Query("DELETE FROM Door d WHERE d.kitchen.id = :kitchenId AND d.id NOT IN :idsToKeep")
    void deleteByKitchenIdAndIdNotIn(@Param("kitchenId") Integer kitchenId, @Param("idsToKeep") List<Integer> idsToKeep);
}