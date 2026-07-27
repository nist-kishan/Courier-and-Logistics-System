package com.courier_and_logistic_system.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.courier_and_logistic_system.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer>{
	
	Optional<Customer> findByCustomerPhone(String phoneNumber);
	Optional<Customer> findByCustomerEmail(String phoneNumber);
	Boolean existsByCustomerPhone(String phoneNumber);
	Boolean existsByCustomerEmail(String phoneNumber);
}
