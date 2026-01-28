package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.CabinetProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CabinetProductsRepository extends JpaRepository<CabinetProduct, Integer> {
}