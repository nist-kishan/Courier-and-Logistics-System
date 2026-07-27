package com.courier_and_logistic_system.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.TrackingHistory;
import com.courier_and_logistic_system.enums.DeliveryStatus;
import com.courier_and_logistic_system.execption.InvalidStatusException;
import com.courier_and_logistic_system.execption.NoRecordFoundException;
import com.courier_and_logistic_system.repository.TrackingHistoryRepository;
import com.courier_and_logistic_system.utils.HelperMethod;

@Service
public class TrackingHistoryService {

	@Autowired
	private TrackingHistoryRepository trackingHistoryRepository;

	public ResponseStructure<List<TrackingHistory>> getAllTrackingHistory() {
		List<TrackingHistory> trackingHistories = trackingHistoryRepository.findAll();

		if (trackingHistories.isEmpty()) {
			throw new NoRecordFoundException("No tracking history records found.");
		}

		ResponseStructure<List<TrackingHistory>> res = new ResponseStructure<List<TrackingHistory>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("All tracking history records retrieved successfully.");
		res.setData(trackingHistories);

		return res;
	}

	public ResponseStructure<TrackingHistory> getTrackingHistoryById(Integer trackingHistoryId) {
		Optional<TrackingHistory> trackingHistory = trackingHistoryRepository.findById(trackingHistoryId);

		if (trackingHistory.isEmpty()) {
			throw new NoRecordFoundException("Tracking history not found with ID: " + trackingHistoryId);
		}

		ResponseStructure<TrackingHistory> res = new ResponseStructure<TrackingHistory>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Tracking history details retrieved successfully.");
		res.setData(trackingHistory.get());

		return res;
	}

	public ResponseStructure<TrackingHistory> getTrackingHistoryByTrackingNumber(Integer trackingNumber) {
		Optional<TrackingHistory> trackingHistory = trackingHistoryRepository
				.findByShipmentTrackingNumber(trackingNumber);

		if (trackingHistory.isEmpty()) {
			throw new NoRecordFoundException("Tracking history not found with tracking number: " + trackingNumber);
		}

		ResponseStructure<TrackingHistory> res = new ResponseStructure<TrackingHistory>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Tracking history details retrieved successfully.");
		res.setData(trackingHistory.get());

		return res;
	}

	public ResponseStructure<List<TrackingHistory>> getTrackingHistoriesByDeliveryStatus(String deliveryStatus) {
		if (!HelperMethod.deliveryStatusValidation(deliveryStatus)) {
			throw new InvalidStatusException("Invalid delivery status: " + deliveryStatus);
		}
		List<TrackingHistory> trackingHistories = trackingHistoryRepository
				.findByDeliveryStatus(DeliveryStatus.valueOf(deliveryStatus.toUpperCase()));

		if (trackingHistories.isEmpty()) {
			throw new NoRecordFoundException(
					"No tracking history records found with delivery status: " + deliveryStatus.toUpperCase());
		}

		ResponseStructure<List<TrackingHistory>> res = new ResponseStructure<List<TrackingHistory>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage(
			    "Tracking history records retrieved successfully."
			);
		res.setData(trackingHistories);

		return res;
	}

}
