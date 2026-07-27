package com.courier_and_logistic_system.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.courier_and_logistic_system.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Integer>{
	
}
