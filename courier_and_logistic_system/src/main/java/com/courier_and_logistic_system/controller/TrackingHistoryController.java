package com.courier_and_logistic_system.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.TrackingHistory;
import com.courier_and_logistic_system.service.TrackingHistoryService;

@RestController
@RequestMapping("/tracking-history")
public class TrackingHistoryController {

	@Autowired
	private TrackingHistoryService trackingHistoryService;

	@GetMapping
	public ResponseEntity<ResponseStructure<List<TrackingHistory>>> getAllTrackingHistory() {
		return new ResponseEntity<>(trackingHistoryService.getAllTrackingHistory(), HttpStatus.OK);
	}

	@GetMapping("/{trackingHistoryId}")
	public ResponseEntity<ResponseStructure<TrackingHistory>> getTrackingHistoryById(@PathVariable Integer trackingHistoryId) {
		return new ResponseEntity<>(trackingHistoryService.getTrackingHistoryById(trackingHistoryId), HttpStatus.OK);
	}

	@GetMapping("/tracking-number/{trackingNumber}")
	public ResponseEntity<ResponseStructure<TrackingHistory>> getTrackingHistoryByTrackingNumber(@PathVariable Integer trackingNumber) {
		return new ResponseEntity<>(trackingHistoryService.getTrackingHistoryByTrackingNumber(trackingNumber),HttpStatus.OK);
	}

	@GetMapping("/status/{deliveryStatus}")
	public ResponseEntity<ResponseStructure<List<TrackingHistory>>> getTrackingHistoriesByDeliveryStatus(@PathVariable String deliveryStatus) {
		return new ResponseEntity<>(trackingHistoryService.getTrackingHistoriesByDeliveryStatus(deliveryStatus),HttpStatus.OK);
	}
}