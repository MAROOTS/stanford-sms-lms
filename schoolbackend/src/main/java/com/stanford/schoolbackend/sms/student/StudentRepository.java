package com.stanford.schoolbackend.sms.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByClassSectionId(Long classSectionId);
    List<Student> findByClassSectionIdIn(List<Long> classSectionIds);
    Optional<Student> findByUsername(String username);
    long countBySchoolId(Long schoolId);
    List<Student> findBySchoolId(Long schoolId);
    boolean existsByAdmissionNumberAndSchoolId(String admissionNumber, Long schoolId);
    boolean existsByAdmissionNumberAndSchoolIdAndIdNot(String admissionNumber, Long schoolId, Long id);
    @Query("""
        select gl.name, count(s)
        from Student s
        join s.classSection cs
        join cs.gradeLevel gl
        where s.school.id = :schoolId
        group by gl.name
        order by gl.name
        """)
    List<Object[]> countEnrolmentByGrade(@Param("schoolId") Long schoolId);

}
