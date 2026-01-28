package com.boxy.cabinet_design.repository;

import com.boxy.cabinet_design.entity.Cabinetsrule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CabinetsruleRepository extends JpaRepository<Cabinetsrule, Integer> {
    List<Cabinetsrule> findAll();
}