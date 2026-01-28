package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.Kitchen;
import com.boxy.cabinet_design.entity.Wall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WallRepository extends JpaRepository<Wall, Integer> {
    List<Wall> findAllByKitchenId(Integer kitchenId);
}
