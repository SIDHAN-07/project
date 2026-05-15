package com.foodredistribution.service;

import com.foodredistribution.model.Donation;
import com.foodredistribution.model.ImpactStats;
import com.foodredistribution.repository.DonationRepository;
import com.foodredistribution.repository.ImpactStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
public class FoodService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private ImpactStatsRepository impactStatsRepository;

    @PostConstruct
    public void initStats() {
        if (impactStatsRepository.count() == 0) {
            impactStatsRepository.save(new ImpactStats(null, 15420L, 3200L, 25.0));
        }
    }

    public List<Donation> getAllDonations() {
        return donationRepository.findAllByOrderByIdDesc();
    }

    public Donation addDonation(Donation donation) {
        donation.setClaimed(false);
        return donationRepository.save(donation);
    }

    public Optional<Donation> claimDonation(Long id) {
        Optional<Donation> donationOpt = donationRepository.findById(id);
        if (donationOpt.isPresent()) {
            Donation donation = donationOpt.get();
            if (!donation.isClaimed()) {
                donation.setClaimed(true);
                donationRepository.save(donation);

                // Update Stats
                ImpactStats stats = getImpactStats();
                stats.setMealsRescued(stats.getMealsRescued() + donation.getQuantity());
                stats.setCo2Reduced(stats.getCo2Reduced() + (donation.getQuantity() * 0.001));
                impactStatsRepository.save(stats);
            }
            return Optional.of(donation);
        }
        return Optional.empty();
    }

    public ImpactStats getImpactStats() {
        return impactStatsRepository.findAll().stream().findFirst()
                .orElse(new ImpactStats(null, 0L, 0L, 0.0));
    }
}
