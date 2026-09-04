package com.stanford.schoolbackend.sms.parent.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GuardianLinkResult {
    private Long parentId;
    private String username;
    /** Set only when a new parent account was created. */
    private String temporaryPassword;
    private boolean created;
}