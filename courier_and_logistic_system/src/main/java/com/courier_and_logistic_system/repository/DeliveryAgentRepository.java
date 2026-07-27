package com.courier_and_logistic_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.courier_and_logistic_system.entity.DeliveryAgent;

@Repository
public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Integer>{
	Boolean existsByDeliveryAgentContactNumber(String contactNumber);
	Boolean existsByVehicleNumber(String vehicleNumber);
	Optional<DeliveryAgent> findByVehicleNumber(String vehicleNumber);
	Optional<DeliveryAgent> findByDeliveryAgentContactNumber(String contactNumber);
	List<DeliveryAgent> findByRatingGreaterThan(Integer rating);
	
}
