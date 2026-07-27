package com.courier_and_logistic_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.courier_and_logistic_system.entity.TrackingHistory;
import com.courier_and_logistic_system.enums.DeliveryStatus;

public interface TrackingHistoryRepository extends JpaRepository<TrackingHistory, Integer>{
	List<TrackingHistory> findByDeliveryStatus(DeliveryStatus deliveryStatus);
	Optional<TrackingHistory> findByShipmentTrackingNumber(Integer trackingNumber);
}
