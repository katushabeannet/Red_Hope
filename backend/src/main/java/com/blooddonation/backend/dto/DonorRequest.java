package com.blooddonation.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DonorRequest {
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    @NotBlank(message = "Blood group is required")
    private String bloodGroup;
    
    private String location;
    
    private Boolean wantsSmsAlerts = false;
}