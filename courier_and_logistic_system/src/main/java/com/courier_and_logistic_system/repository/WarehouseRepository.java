package com.courier_and_logistic_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.courier_and_logistic_system.entity.Warehouse;

public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {
	List<Warehouse> findByLocation(String location);
	List<Warehouse> findBycapacityGreaterThan(Double value);
	Optional<Warehouse> findByWarehouseContactNumber(String contactNumber);
	Boolean existsByWarehouseContactNumber(String contactNumber);
}
