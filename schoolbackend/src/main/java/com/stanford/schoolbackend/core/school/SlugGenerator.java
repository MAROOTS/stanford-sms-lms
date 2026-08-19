package com.stanford.schoolbackend.core.school;

import org.springframework.stereotype.Component;
import java.text.Normalizer;
import java.util.regex.Pattern;

@Component
public class SlugGenerator {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    public String generate(String input) {
        String noWhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(normalized).replaceAll("").toLowerCase();
        return slug.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
    }
}