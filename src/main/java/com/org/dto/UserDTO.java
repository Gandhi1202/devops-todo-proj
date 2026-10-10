package com.org.dto;


import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Long roleId;
    private Long contact;
    // private String  password;


    public UserDTO(String name, String email, Long roleId, Long contact, Long id) {
        this.name = name;
        this.email = email;
        this.roleId = roleId;
        this.contact = contact;
        this.id = id;
    }
}
