package com.courier_and_logistic_system.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.DeliveryAgent;
import com.courier_and_logistic_system.service.DeliveryAgentService;

@RestController
@RequestMapping("/delivery-agents")
public class DeliveryAgentController {

	@Autowired
	private DeliveryAgentService deliveryAgentService;

	@PostMapping
	public ResponseEntity<ResponseStructure<DeliveryAgent>> createNewDeliveryAgent(@RequestBody DeliveryAgent newDeliveryAgent) {
		return new ResponseEntity<>(deliveryAgentService.createNewDeliveryAgent(newDeliveryAgent), HttpStatus.CREATED);
	}

	@GetMapping
	public ResponseEntity<ResponseStructure<List<DeliveryAgent>>> getAllDeliveryAgent() {
		return new ResponseEntity<>(deliveryAgentService.getAllDeliveryAgent(), HttpStatus.OK);
	}

	@GetMapping("/{deliveryAgentId}")
	public ResponseEntity<ResponseStructure<DeliveryAgent>> getDeliveryAgentById(@PathVariable Integer deliveryAgentId) {
		return new ResponseEntity<>(deliveryAgentService.getDeliveryAgentById(deliveryAgentId), HttpStatus.OK);
	}

	@GetMapping("/vehicle/{vehicleNumber}")
	public ResponseEntity<ResponseStructure<DeliveryAgent>> getDeliveryAgentByVehicleNumber(@PathVariable String vehicleNumber) {
		return new ResponseEntity<>(deliveryAgentService.getDeliveryAgentByVehicleNumber(vehicleNumber), HttpStatus.OK);
	}

	@GetMapping("/contact/{contactNumber}")
	public ResponseEntity<ResponseStructure<DeliveryAgent>> getDeliveryAgentByContactNumber(@PathVariable String contactNumber) {
		return new ResponseEntity<>(deliveryAgentService.getDeliveryAgentByContactNumber(contactNumber), HttpStatus.OK);
	}

	@GetMapping("/rating/{rating}")
	public ResponseEntity<ResponseStructure<List<DeliveryAgent>>> getAllDeliveryAgentWithRating(@PathVariable Integer rating) {
		return new ResponseEntity<>(deliveryAgentService.getAllDeliveryAgentWithRating(rating), HttpStatus.OK);
	}

	@PatchMapping("/{deliveryAgentId}")
	public ResponseEntity<ResponseStructure<DeliveryAgent>> updateDeliveryAgentById(@PathVariable Integer deliveryAgentId, @RequestBody Map<String, String> updatedDeliveryAgentInfo) {
		return new ResponseEntity<>(deliveryAgentService.updateDeliveryAgentById(deliveryAgentId, updatedDeliveryAgentInfo), HttpStatus.OK);
	}

	@PatchMapping("/{deliveryAgentId}/availability")
	public ResponseEntity<ResponseStructure<DeliveryAgent>> updateAvailability(@PathVariable Integer deliveryAgentId,@RequestBody Map<String, String> updatedAvailability) {
		return new ResponseEntity<>(deliveryAgentService.updateAvailability(deliveryAgentId, updatedAvailability),HttpStatus.OK);
	}

	@DeleteMapping("/{deliveryAgentId}")
	public ResponseEntity<ResponseStructure<String>> deleteDeliveryAgentById(@PathVariable Integer deliveryAgentId) {
		return new ResponseEntity<>(deliveryAgentService.deleteDeliveryAgentById(deliveryAgentId), HttpStatus.OK);
	}
}