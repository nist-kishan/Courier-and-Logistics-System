package com.courier_and_logistic_system.entity;

import com.courier_and_logistic_system.dto.Dimension;
import com.courier_and_logistic_system.enums.PackageType;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Embedded;
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
public class PackageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer packageId;

    @Enumerated(EnumType.STRING)
    private PackageType packageType;

    private Boolean fragile;

    @Embedded
    private Dimension dimension;

    @OneToOne(mappedBy = "packageEntity")
    @JsonIgnore
    private Shipment shipment;
}