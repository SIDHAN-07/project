package com.foodredistribution.controller;

import com.foodredistribution.model.Donation;
import com.foodredistribution.model.ImpactStats;
import com.foodredistribution.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow requests from any origin for prototyping
public class FoodController {

    @Autowired
    private FoodService foodService;

    @GetMapping("/donations")
    public List<Donation> getDonations() {
        return foodService.getAllDonations();
    }

    @PostMapping("/donations")
    public Donation createDonation(@RequestBody Donation donation) {
        return foodService.addDonation(donation);
    }

    @PutMapping("/donations/{id}/claim")
    public ResponseEntity<Donation> claimDonation(@PathVariable Long id) {
        return foodService.claimDonation(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ImpactStats getStats() {
        return foodService.getImpactStats();
    }
}
