package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.dto.ItemListDto;
import com.boxy.cabinet_design.entity.Cabinet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CabinetRepository extends JpaRepository<Cabinet, Integer> {
    void deleteByKitchenId(Integer kitchenId);
    List<Cabinet> findAllByType(String type);
    List<Cabinet> findAllByTypeAndKitchenIdAndWallid(String type, Integer kitchenId, Integer wallid);
    List<Cabinet> findByKitchenId(Integer kitchenId);

    @Query(value = "SELECT c.name as name, c.construction as construction, COUNT(c.id) as count, COALESCE(MAX(p.price), 0.0) as price, 0.0 as defaultValue " +
            "FROM cabinets c " +
            "LEFT JOIN cabinetproducts p ON c.name = p.name " +
            "WHERE c.kitchenid = :kitchenId " +
            "AND c.cabinettype NOT IN ('window', 'door', 'appliance') " +
            "GROUP BY c.name, c.construction", nativeQuery = true)
    List<Object[]> findCabinetsByKitchenId(@Param("kitchenId") Integer kitchenId);
    
    
    
    @Query(value =
            "SELECT " +
            " c.name AS cabName, " +
            " c.construction AS seriesCode, " +
            " p.color AS seriesColor, " +
            " k.id AS po, " +
            " k.kitchenName AS customer, " +
            " COUNT(*) AS quantity " +
            "FROM cabinets c " +
            "LEFT JOIN products p ON c.construction = p.code " +
            "LEFT JOIN kitchens k ON c.kitchenid = k.id " +
            "WHERE c.kitchenid = :kitchenId " +
            "AND c.cabinettype NOT IN ('window', 'door', 'appliance') " +
            "GROUP BY c.name, c.construction, p.color, k.id, k.kitchenName",
            nativeQuery = true)
    List<Object[]> findCabProductionByKitchenId(@Param("kitchenId") Integer kitchenId);

}
