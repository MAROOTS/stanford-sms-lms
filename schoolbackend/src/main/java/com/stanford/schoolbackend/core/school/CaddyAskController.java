package com.stanford.schoolbackend.core.school;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class CaddyAskController {

    private static final String ROOT = "stanfordos.co.ke";

    @GetMapping("/caddy-ask")
    public ResponseEntity<Void> ask(@RequestParam String domain) {
        if (domain == null || domain.isBlank()) {
            return ResponseEntity.status(403).build();
        }
        String d = domain.toLowerCase().trim();

        // On-demand is only for school subdomains, not apex / www / files
        if (!d.endsWith("." + ROOT)) {
            return ResponseEntity.status(403).build();
        }

        String sub = d.substring(0, d.length() - ROOT.length() - 1);
        if (sub.isEmpty() || sub.contains(".") || "www".equals(sub) || "files".equals(sub)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok().build();
    }
}