package com.stanford.schoolbackend.sms.communication.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class AfricaTalkingSmsProvider {

    private final RestClient restClient;
    private final String username;
    private final String senderId;
    private final boolean sandbox;

    public AfricaTalkingSmsProvider(
            @Value("${africastalking.username:}") String username,
            @Value("${africastalking.api-key:}") String apiKey,
            @Value("${africastalking.sender-id:}") String senderId,
            @Value("${africastalking.sandbox:true}") boolean sandbox) {
        this.username = username;
        this.senderId = senderId;
        this.sandbox = sandbox;
        String base = sandbox
                ? "https://api.sandbox.africastalking.com"
                : "https://api.africastalking.com";
        this.restClient = RestClient.builder()
                .baseUrl(base)
                .defaultHeader("apiKey", apiKey == null ? "" : apiKey)
                .defaultHeader("Accept", "application/json")
                .build();
    }

    public SendResult send(String phone, String message) {
        if (username == null || username.isBlank()) {
            return SendResult.fail("SMS is not configured");
        }
        var form = new LinkedMultiValueMap<String, String>();
        form.add("username", username);
        form.add("to", phone);
        form.add("message", message);
        if (senderId != null && !senderId.isBlank() && !sandbox) {
            form.add("from", senderId);
        }
        try {
            String body = restClient.post()
                    .uri("/version1/messaging")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(String.class);
            if (body != null && body.toLowerCase().contains("success")) {
                return SendResult.ok(null);
            }
            return SendResult.fail(trim(body));
        } catch (Exception e) {
            log.warn("AT SMS failed to {}: {}", phone, e.getMessage());
            return SendResult.fail(e.getMessage());
        }
    }

    private static String trim(String s) {
        if (s == null) return "Provider error";
        return s.length() > 400 ? s.substring(0, 400) : s;
    }

    public record SendResult(boolean ok, String providerId, String error) {
        static SendResult ok(String id) { return new SendResult(true, id, null); }
        static SendResult fail(String err) { return new SendResult(false, null, err); }
    }
}