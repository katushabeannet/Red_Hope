package com.blooddonation.backend.controller;

import com.blooddonation.backend.dto.DonorRequest;
import com.blooddonation.backend.model.Donor;
import com.blooddonation.backend.service.DonorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donors")
@CrossOrigin(origins = "http://localhost:5173")
public class DonorController {
    
    @Autowired
    private DonorService donorService;
    
    // 1. GET ALL DONORS
    @GetMapping
    public ResponseEntity<List<Donor>> getAllDonors() {
        List<Donor> donors = donorService.getAllDonors();
        return new ResponseEntity<>(donors, HttpStatus.OK);
    }
    
    // 2. GET DONOR BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Donor> getDonorById(@PathVariable Long id) {
        Donor donor = donorService.getDonorById(id);
        return new ResponseEntity<>(donor, HttpStatus.OK);
    }
    
    
    // 4. UPDATE DONOR
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDonor(@PathVariable Long id, @Valid @RequestBody DonorRequest donorRequest) {
        try {
            Donor donor = donorService.updateDonor(id, donorRequest);
            return new ResponseEntity<>(donor, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
    
    // 5. DELETE DONOR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonor(@PathVariable Long id) {
        donorService.deleteDonor(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    // 6. FIND BY BLOOD GROUP
    @GetMapping("/blood-group/{bloodGroup}")
    public ResponseEntity<List<Donor>> getDonorsByBloodGroup(@PathVariable String bloodGroup) {
        List<Donor> donors = donorService.getDonorsByBloodGroup(bloodGroup);
        return new ResponseEntity<>(donors, HttpStatus.OK);
    }
    
    // 7. HEALTH CHECK ENDPOINT
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return new ResponseEntity<>("Donor API is running!", HttpStatus.OK);
    }
}