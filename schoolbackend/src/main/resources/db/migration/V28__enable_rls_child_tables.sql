ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_enrollments ON enrollments
    USING (course_id IN (SELECT id FROM courses WHERE school_id = current_setting('app.current_school_id', true)::bigint));

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_assignments ON assignments
    USING (course_id IN (SELECT id FROM courses WHERE school_id = current_setting('app.current_school_id', true)::bigint));

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_submissions ON submissions
    USING (assignment_id IN (
    SELECT a.id FROM assignments a JOIN courses c ON a.course_id = c.id
    WHERE c.school_id = current_setting('app.current_school_id', true)::bigint
));

ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_marks ON marks
    USING (exam_id IN (SELECT id FROM exams WHERE school_id = current_setting('app.current_school_id', true)::bigint));

ALTER TABLE class_attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_class_attendance_records ON class_attendance_records
    USING (class_session_id IN (SELECT id FROM class_sessions WHERE school_id = current_setting('app.current_school_id', true)::bigint));

ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fee_payments ON fee_payments
    USING (invoice_id IN (SELECT id FROM fee_invoices WHERE school_id = current_setting('app.current_school_id', true)::bigint));

ALTER TABLE book_copies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_book_copies ON book_copies
    USING (book_id IN (SELECT id FROM books WHERE school_id = current_setting('app.current_school_id', true)::bigint));

ALTER TABLE book_loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_book_loans ON book_loans
    USING (book_copy_id IN (
    SELECT bc.id FROM book_copies bc JOIN books b ON bc.book_id = b.id
    WHERE b.school_id = current_setting('app.current_school_id', true)::bigint
));

ALTER TABLE book_holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_book_holds ON book_holds
    USING (book_id IN (SELECT id FROM books WHERE school_id = current_setting('app.current_school_id', true)::bigint));