package com.stanford.schoolbackend.sms.parent;

import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ParentAccessService {

    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final UserRepository userRepository;

    public boolean isCurrentUserParentOf(Long studentId) {
        if (!SecurityUtils.currentUserHasRole("PARENT")) return false;
        return userRepository.findByUsername(SecurityUtils.currentUsername())
                .map(user -> parentStudentLinkRepository.existsByParentIdAndStudentId(user.getId(), studentId))
                .orElse(false);
    }
}