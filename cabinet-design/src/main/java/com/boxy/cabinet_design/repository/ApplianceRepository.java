package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.Appliance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplianceRepository extends JpaRepository<Appliance, Integer> {
    List<Appliance> findAllByKitchenId(Integer kitchenId);
    
    void deleteByIdNotIn(List<Integer> ids);
    void deleteByKitchenIdAndIdNotIn(Integer kitchenId, List<Integer> idsToKeep);

    void deleteByKitchenId(Integer kitchenId);
    
    
}