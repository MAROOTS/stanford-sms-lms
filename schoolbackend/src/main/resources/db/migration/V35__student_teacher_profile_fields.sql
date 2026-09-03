ALTER TABLE students
    ADD COLUMN IF NOT EXISTS date_of_birth date,
    ADD COLUMN IF NOT EXISTS gender varchar(20),
    ADD COLUMN IF NOT EXISTS nationality varchar(80),
    ADD COLUMN IF NOT EXISTS religion varchar(80),
    ADD COLUMN IF NOT EXISTS admission_date date,
    ADD COLUMN IF NOT EXISTS birth_certificate_no varchar(80),
    ADD COLUMN IF NOT EXISTS address varchar(255),
    ADD COLUMN IF NOT EXISTS guardian_name varchar(120),
    ADD COLUMN IF NOT EXISTS guardian_phone varchar(40),
    ADD COLUMN IF NOT EXISTS guardian_email varchar(120),
    ADD COLUMN IF NOT EXISTS guardian_relationship varchar(40),
    ADD COLUMN IF NOT EXISTS blood_group varchar(8),
    ADD COLUMN IF NOT EXISTS allergies text,
    ADD COLUMN IF NOT EXISTS medical_conditions text,
    ADD COLUMN IF NOT EXISTS emergency_contact_name varchar(120),
    ADD COLUMN IF NOT EXISTS emergency_contact_phone varchar(40),
    ADD COLUMN IF NOT EXISTS previous_school varchar(160);

ALTER TABLE teachers
    ADD COLUMN IF NOT EXISTS phone varchar(40),
    ADD COLUMN IF NOT EXISTS tsc_number varchar(40),
    ADD COLUMN IF NOT EXISTS national_id varchar(40),
    ADD COLUMN IF NOT EXISTS date_of_birth date,
    ADD COLUMN IF NOT EXISTS gender varchar(20),
    ADD COLUMN IF NOT EXISTS date_of_employment date,
    ADD COLUMN IF NOT EXISTS address varchar(255);