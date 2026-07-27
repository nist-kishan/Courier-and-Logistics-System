package com.courier_and_logistic_system.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.Payment;
import com.courier_and_logistic_system.enums.PaymentStatus;
import com.courier_and_logistic_system.execption.InvalidStatusException;
import com.courier_and_logistic_system.execption.NoRecordFoundException;
import com.courier_and_logistic_system.repository.PaymentRepository;
import com.courier_and_logistic_system.utils.HelperMethod;

@Service
public class PaymentService {

	@Autowired
	private PaymentRepository paymentRepository;

	public ResponseStructure<List<Payment>> getAllPayment() {
		List<Payment> payments = paymentRepository.findAll();

		if (payments.isEmpty()) {
			throw new NoRecordFoundException("No payment records found.");
		}

		ResponseStructure<List<Payment>> res = new ResponseStructure<List<Payment>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("All payment records retrieved successfully.");
		res.setData(payments);

		return res;
	}

	public ResponseStructure<Payment> getPaymentById(Integer paymentId) {
		Optional<Payment> payment = paymentRepository.findById(paymentId);

		if (payment.isEmpty()) {
			throw new NoRecordFoundException("Payment not found with ID: " + paymentId);
		}

		ResponseStructure<Payment> res = new ResponseStructure<Payment>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Payment details retrieved successfully.");
		res.setData(payment.get());

		return res;
	}

	public ResponseStructure<Payment> updatePaymentStatus(Integer paymentId, Map<String, String> paymentStatus) {

		if (paymentStatus == null || !paymentStatus.containsKey("paymentStatus")) {
			throw new InvalidStatusException("Payment status is required.");
		}

		String status = paymentStatus.get("paymentStatus");

		if (!HelperMethod.paymentStatusValidation(status)) {
			throw new InvalidStatusException("Invalid payment status: " + status);
		}

		Optional<Payment> paymentOptional = paymentRepository.findById(paymentId);

		if (paymentOptional.isEmpty()) {
			throw new NoRecordFoundException("Payment not found with ID: " + paymentId);
		}

		Payment payment = paymentOptional.get();

		payment.setPaymentStatus(PaymentStatus.valueOf(status.toUpperCase()));

		payment = paymentRepository.save(payment);

		ResponseStructure<Payment> res = new ResponseStructure<>();

		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Payment status updated successfully.");
		res.setData(payment);

		return res;
	}

	public ResponseStructure<String> deletePayment(Integer paymentId) {
		Optional<Payment> payment = paymentRepository.findById(paymentId);

		if (payment.isEmpty()) {
			throw new NoRecordFoundException("Payment not found with ID: " + paymentId);
		}

		paymentRepository.deleteById(paymentId);

		ResponseStructure<String> res = new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Payment deleted successfully. ID: " + paymentId);
		res.setData("Deleted");

		return res;
	}

}
