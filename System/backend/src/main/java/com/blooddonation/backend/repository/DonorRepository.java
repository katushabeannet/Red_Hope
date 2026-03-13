package com.blooddonation.backend.repository;

import com.blooddonation.backend.model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {
    List<Donor> findByBloodGroup(String bloodGroup);
    
    // helper for registration/login
    boolean existsByEmailIgnoreCase(String email);
    
    java.util.Optional<Donor> findByEmailIgnoreCase(String email);
}