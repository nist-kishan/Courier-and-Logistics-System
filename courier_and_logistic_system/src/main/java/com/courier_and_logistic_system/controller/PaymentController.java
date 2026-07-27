package com.courier_and_logistic_system.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.Payment;
import com.courier_and_logistic_system.service.PaymentService;

@RestController
@RequestMapping("/payments")
public class PaymentController {

	@Autowired
	private PaymentService paymentService;

	@GetMapping
	public ResponseEntity<ResponseStructure<List<Payment>>> getAllPayment() {
		return new ResponseEntity<>(paymentService.getAllPayment(), HttpStatus.OK);
	}

	@GetMapping("/{paymentId}")
	public ResponseEntity<ResponseStructure<Payment>> getPaymentById(@PathVariable Integer paymentId) {
		return new ResponseEntity<>(paymentService.getPaymentById(paymentId), HttpStatus.OK);
	}

	@PatchMapping("/{paymentId}/status")
	public ResponseEntity<ResponseStructure<Payment>> updatePaymentStatus(@PathVariable Integer paymentId,@RequestBody Map<String, String> paymentStatus) {
		return new ResponseEntity<>(paymentService.updatePaymentStatus(paymentId, paymentStatus), HttpStatus.OK);
	}

	@DeleteMapping("/{paymentId}")
	public ResponseEntity<ResponseStructure<String>> deletePayment(@PathVariable Integer paymentId) {
		return new ResponseEntity<>(paymentService.deletePayment(paymentId), HttpStatus.OK);
	}
}