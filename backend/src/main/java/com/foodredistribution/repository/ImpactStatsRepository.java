package com.foodredistribution.repository;

import com.foodredistribution.model.ImpactStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImpactStatsRepository extends JpaRepository<ImpactStats, Long> {
}
