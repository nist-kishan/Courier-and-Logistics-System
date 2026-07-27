package com.courier_and_logistic_system.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.courier_and_logistic_system.enums.DeliveryStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Shipment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer shipmentId;
	
	@Column(unique = true)
	private Integer trackingNumber;
	
	private String source;
	
	private String destination;
	
	private Double weight;
	
	@CreationTimestamp
	private LocalDateTime shipmentTime;
	
	private LocalDate deliveryDate;
	
	private DeliveryStatus deliveryStatus;
	
	@ManyToOne
	@JoinColumn(name = "customer_id")
	private Customer customer;

	@ManyToOne
	@JoinColumn(name = "warehouse_id")
	private Warehouse warehouse;

	@ManyToOne
	@JoinColumn(name = "delivery_agent_id")
	private DeliveryAgent deliveryAgent;
	
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "payment_id")
	private Payment payment;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "package_id")
	private PackageEntity packageEntity;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "tracking_id")
	private TrackingHistory trackingHistory;
}
