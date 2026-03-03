package com.blooddonation.backend.service;

import com.blooddonation.backend.dto.DonorRequest;
import com.blooddonation.backend.model.Donor;
import com.blooddonation.backend.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonorService {
    
    @Autowired
    private DonorRepository donorRepository;

    // simple password encoder; could be moved to config
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    
    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }
    
    public Donor getDonorById(Long id) {
        return donorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donor not found with id: " + id));
    }
    
    public Donor createDonor(DonorRequest donorRequest) {
        // Check if email already exists
        if (donorRepository.existsByEmailIgnoreCase(donorRequest.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        Donor donor = new Donor();
        donor.setFullName(donorRequest.getFullName());
        donor.setEmail(donorRequest.getEmail());
        donor.setPhone(donorRequest.getPhone());
        donor.setBloodGroup(donorRequest.getBloodGroup());
        donor.setLocation(donorRequest.getLocation());
        donor.setWantsSmsAlerts(donorRequest.getWantsSmsAlerts());
        // encode password before saving
        donor.setPassword(encoder.encode(donorRequest.getPassword()));
        donor.setRole(donorRequest.getRole().toUpperCase());
        
        return donorRepository.save(donor);
    }
    
    public Donor updateDonor(Long id, DonorRequest donorRequest) {
        Donor donor = getDonorById(id);
        
        donor.setFullName(donorRequest.getFullName());
        donor.setEmail(donorRequest.getEmail());
        donor.setPhone(donorRequest.getPhone());
        donor.setBloodGroup(donorRequest.getBloodGroup());
        donor.setLocation(donorRequest.getLocation());
        donor.setWantsSmsAlerts(donorRequest.getWantsSmsAlerts());
        if (donorRequest.getPassword() != null && !donorRequest.getPassword().isBlank()) {
            donor.setPassword(encoder.encode(donorRequest.getPassword()));
        }
        if (donorRequest.getRole() != null) {
            donor.setRole(donorRequest.getRole().toUpperCase());
        }
        
        return donorRepository.save(donor);
    }
    
    public void deleteDonor(Long id) {
        donorRepository.deleteById(id);
    }
    
    public List<Donor> getDonorsByBloodGroup(String bloodGroup) {
        return donorRepository.findByBloodGroup(bloodGroup);
    }
}