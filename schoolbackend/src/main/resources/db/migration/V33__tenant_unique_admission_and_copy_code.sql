-- admission_number: allow the same value at two schools
ALTER TABLE students DROP CONSTRAINT IF EXISTS uk4ijilwehsq4n3vhrdlq722lnc;

-- copy_code: unique per school
ALTER TABLE book_copies ADD COLUMN IF NOT EXISTS school_id BIGINT REFERENCES schools(id);

UPDATE book_copies bc
SET school_id = b.school_id
FROM books b
WHERE b.id = bc.book_id
  AND bc.school_id IS NULL;

ALTER TABLE book_copies ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE book_copies DROP CONSTRAINT IF EXISTS ukf2bi6ld4nn88uyra2kgxn6py2;
ALTER TABLE book_copies DROP CONSTRAINT IF EXISTS uk_book_copies_school_code;
ALTER TABLE book_copies ADD CONSTRAINT uk_book_copies_school_code UNIQUE (school_id, copy_code);