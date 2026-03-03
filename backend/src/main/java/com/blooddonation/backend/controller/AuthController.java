package com.blooddonation.backend.controller;

import com.blooddonation.backend.dto.DonorRequest;
import com.blooddonation.backend.model.Donor;
import com.blooddonation.backend.service.DonorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private DonorService donorService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody DonorRequest donorRequest) {
        try {
            Donor donor = donorService.createDonor(donorRequest);
            return new ResponseEntity<>(donor, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
