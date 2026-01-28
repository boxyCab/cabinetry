package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.PeninisulaConnection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeninisulaConnectionRepository extends JpaRepository<PeninisulaConnection, Integer> {
    List<PeninisulaConnection> findAllByKitchenId(Integer kitchenId);

    // 根据 kitchenId 和 isLowerCabinetConnected 查询
    List<PeninisulaConnection> findByKitchenIdAndIsLowerCabinetConnected(Integer kitchenId, Boolean isLowerCabinetConnected);
    List<PeninisulaConnection> findByKitchenIdAndIsUpperCabinetConnected(Integer kitchenId, Boolean isUpperCabinetConnected);
}
