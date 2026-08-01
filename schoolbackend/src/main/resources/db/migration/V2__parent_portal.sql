--
-- V2: Parent Portal
--

-- Parent table (extends users via JOINED inheritance)
CREATE TABLE public.parents (
    id bigint NOT NULL,
    occupation character varying(255),
    alternate_phone character varying(255),
    address text,
    CONSTRAINT parents_pkey PRIMARY KEY (id),
    CONSTRAINT fk_parents_users FOREIGN KEY (id) REFERENCES public.users(id)
);

-- Many-to-many link between parents and students
CREATE TABLE public.parent_student (
    parent_id bigint NOT NULL,
    student_id bigint NOT NULL,
    relationship character varying(50) NOT NULL DEFAULT 'GUARDIAN',
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT parent_student_pkey PRIMARY KEY (parent_id, student_id),
    CONSTRAINT fk_parent_student_parent FOREIGN KEY (parent_id) REFERENCES public.parents(id),
    CONSTRAINT fk_parent_student_student FOREIGN KEY (student_id) REFERENCES public.students(id)
);

-- Update announcements audience check to include PARENTS
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_audience_check;
ALTER TABLE public.announcements ADD CONSTRAINT announcements_audience_check CHECK (((audience)::text = ANY ((ARRAY['ALL'::character varying, 'TEACHERS'::character varying, 'STUDENTS'::character varying, 'PARENTS'::character varying])::text[])));