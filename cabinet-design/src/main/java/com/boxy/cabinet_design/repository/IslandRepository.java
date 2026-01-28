package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.Island;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IslandRepository extends JpaRepository<Island, Integer> {
    Island findAllByKitchenId(long kitchenId);
}