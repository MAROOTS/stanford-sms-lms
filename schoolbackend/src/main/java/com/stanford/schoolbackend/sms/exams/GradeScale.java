package com.stanford.schoolbackend.sms.exams;

public class GradeScale {

    private GradeScale() {}

    public static String gradeFor(double percentage) {
        if (percentage >= 80) return "EE";
        if (percentage >= 50) return "ME";
        if (percentage >= 30) return "AE";
        return "BE";
    }
}