package com.example.backend.fashion.security;

import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException {
        User user;
        
        // Thử tìm theo email
        var userByEmail = userRepository.findByEmail(emailOrPhone);
        
        if (userByEmail.isPresent()) {
            user = userByEmail.get();
        } else {
            // Thử tìm theo số điện thoại
            var userByPhone = userRepository.findByPhone(emailOrPhone);
            
            if (userByPhone.isPresent()) {
                user = userByPhone.get();
            } else {
                throw new UsernameNotFoundException("Không tìm thấy người dùng với email hoặc số điện thoại: " + emailOrPhone);
            }
        }

        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole()));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}
