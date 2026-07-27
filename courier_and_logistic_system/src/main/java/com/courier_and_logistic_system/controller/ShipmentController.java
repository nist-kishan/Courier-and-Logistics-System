package com.courier_and_logistic_system.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.Shipment;
import com.courier_and_logistic_system.service.ShipmentService;

@RestController
@RequestMapping("/shipments")
public class ShipmentController {

	@Autowired
	private ShipmentService shipmentService;

	@PostMapping
	public ResponseEntity<ResponseStructure<Shipment>> createShipment(@RequestBody Shipment shipment) {
		return new ResponseEntity<>(shipmentService.createNewShipment(shipment), HttpStatus.CREATED);
	}

	@GetMapping
	public ResponseEntity<ResponseStructure<List<Shipment>>> getAllShipment() {
		return new ResponseEntity<>(shipmentService.getAllShipment(), HttpStatus.OK);
	}

	@GetMapping("/{shipmentId}")
	public ResponseEntity<ResponseStructure<Shipment>> getShipmentById(@PathVariable Integer shipmentId) {
		return new ResponseEntity<>(shipmentService.getShipmentById(shipmentId), HttpStatus.OK);
	}

	@GetMapping("/tracking/{trackingNumber}")
	public ResponseEntity<ResponseStructure<Shipment>> getShipmentByTrackingNumber(@PathVariable Integer trackingNumber) {
		return new ResponseEntity<>(shipmentService.getShipmentByTrackingNumber(trackingNumber), HttpStatus.OK);
	}

	@GetMapping("/customer/{customerId}")
	public ResponseEntity<ResponseStructure<List<Shipment>>> getAllShipmentByCustomer(@PathVariable Integer customerId) {
		return new ResponseEntity<>(shipmentService.getAllShipmentByCustomer(customerId), HttpStatus.OK);
	}

	@GetMapping("/delivery-agent/{deliveryAgentId}")
	public ResponseEntity<ResponseStructure<List<Shipment>>> getAllShipmentByDeliveryAgent(@PathVariable Integer deliveryAgentId) {
		return new ResponseEntity<>(shipmentService.getAllShipmentByDeliveryAgent(deliveryAgentId), HttpStatus.OK);
	}

	@GetMapping("/delivery-date/{date}")
	public ResponseEntity<ResponseStructure<List<Shipment>>> getAllShipmentByDeliveryDate(@PathVariable LocalDate date) {
		return new ResponseEntity<>(shipmentService.getAllShipmentByDeliveryDate(date), HttpStatus.OK);
	}

	@GetMapping("/pagination")
	public ResponseEntity<ResponseStructure<Page<Shipment>>> getAllShipmentByPaginationAndSorting(@RequestParam Integer currentPage, @RequestParam Integer pageSize, @RequestParam String fieldName,@RequestParam String direction) {
		return new ResponseEntity<>(shipmentService.getAllShipmentByPaginationAndSorting(currentPage, pageSize, fieldName, direction),HttpStatus.OK);
	}

	@PatchMapping("/{shipmentId}/assign-delivery-agent/{deliveryAgentId}")
	public ResponseEntity<ResponseStructure<Shipment>> assignDeliveryAgent(@PathVariable Integer shipmentId,@PathVariable Integer deliveryAgentId) {
		return new ResponseEntity<>(shipmentService.assignDeliveryAgent(shipmentId, deliveryAgentId), HttpStatus.OK);
	}

	@PatchMapping("/{shipmentId}/assign-warehouse/{warehouseId}")
	public ResponseEntity<ResponseStructure<Shipment>> assignWarehouse(@PathVariable Integer shipmentId,@PathVariable Integer warehouseId) {
		return new ResponseEntity<>(shipmentService.assignWarehouse(shipmentId, warehouseId), HttpStatus.OK);
	}
	
	@PatchMapping("/{shipmentId}/status")
	public ResponseEntity<ResponseStructure<Shipment>> updateStatus(@PathVariable Integer shipmentId,@RequestBody Map<String, String> status) {
	    return new ResponseEntity<>(shipmentService.updateStatus(shipmentId, status),HttpStatus.OK);
	}

	@GetMapping("/source/{source}/availability/{availability}")
	public ResponseEntity<ResponseStructure<List<Shipment>>> getAllShipmentBySourceAndAvailability(@PathVariable String source,@PathVariable Boolean availability) {
	    return new ResponseEntity<>(shipmentService.getAllShipmentBySourceAndAvailability(source, availability),HttpStatus.OK);
	}
}