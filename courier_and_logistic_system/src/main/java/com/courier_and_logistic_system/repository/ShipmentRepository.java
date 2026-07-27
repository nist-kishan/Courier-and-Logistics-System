package com.courier_and_logistic_system.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.courier_and_logistic_system.entity.Shipment;

public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {

	Optional<Shipment> findByTrackingNumber(Integer trackingNumber);
	List<Shipment> findByCustomerCustomerId(Integer customerId);
	List<Shipment> findByWarehouseWarehouseId(Integer warehouseId);
	List<Shipment> findByDeliveryAgentDeliveryAgentId(Integer deliveryAgentId);
	List<Shipment> findBySourceAndDeliveryAgentAvailability(String source,Boolean availability);
	List<Shipment> findByDeliveryDate(LocalDate deliveryDate);
}
