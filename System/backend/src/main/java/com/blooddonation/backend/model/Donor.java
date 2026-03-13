package com.blooddonation.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "donors")
@Data
public class Donor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Full name is required")
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    @Column(nullable = false, unique = true)
    private String email;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    @NotBlank(message = "Blood group is required")
    @Column(name = "blood_group", nullable = false)
    private String bloodGroup;
    
    private String location;
    
    @Column(name = "wants_sms_alerts")
    private Boolean wantsSmsAlerts = false;
    
    // authentication-related columns
    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Role is required")
    @Column(nullable = false)
    private String role;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Automatically set timestamps
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}