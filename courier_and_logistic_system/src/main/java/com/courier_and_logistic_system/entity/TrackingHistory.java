package com.courier_and_logistic_system.entity;

import com.courier_and_logistic_system.enums.DeliveryStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

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
public class TrackingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer trackingHistoryId;

    private String currentLocation;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus;

    private String remark;

    @OneToOne(mappedBy = "trackingHistory")
    @JsonIgnore
    private Shipment shipment;
}