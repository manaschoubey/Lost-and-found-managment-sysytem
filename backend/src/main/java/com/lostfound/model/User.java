package com.lostfound.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;
    private String phone;
    private Role role = Role.USER;
    private boolean enabled = true;
    private LocalDateTime createdAt = LocalDateTime.now();
}