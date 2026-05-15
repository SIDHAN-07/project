package com.foodredistribution.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "impact_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImpactStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long mealsRescued;
    private Long activeVolunteers;
    private Double co2Reduced;
}
