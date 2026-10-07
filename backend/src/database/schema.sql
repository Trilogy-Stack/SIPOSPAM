-- ini import dari supabase langsung

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (length(TRIM(BOTH FROM name)) > 0),
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role = ANY (ARRAY['super_admin'::text, 'admin_wilayah'::text, 'admin'::text])),
  region text UNIQUE,
  must_change_password boolean NOT NULL DEFAULT true,
  is_active boolean DEFAULT true,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.pospam (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (length(TRIM(BOTH FROM name)) > 0),
  koor_name text NOT NULL,
  koor_phone text NOT NULL,
  region text NOT NULL,
  location text NOT NULL,
  area text,
  latitude double precision NOT NULL CHECK (latitude >= '-90'::integer::double precision AND latitude <= 90::double precision),
  longitude double precision NOT NULL CHECK (longitude >= '-180'::integer::double precision AND longitude <= 180::double precision),
  facility jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(facility) = 'array'::text),
  photo jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(photo) = 'array'::text AND jsonb_array_length(photo) <= 4),
  CONSTRAINT pospam_pkey PRIMARY KEY (id),
  CONSTRAINT pospam_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.nomor_darurat (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  agency_name text NOT NULL CHECK (length(TRIM(BOTH FROM agency_name)) > 0),
  telephone text NOT NULL,
  category text,
  region text NOT NULL,
  location text,
  area text,
  latitude double precision CHECK (latitude >= '-90'::integer::double precision AND latitude <= 90::double precision),
  longitude double precision CHECK (longitude >= '-180'::integer::double precision AND longitude <= 180::double precision),
  icon text,
  CONSTRAINT nomor_darurat_pkey PRIMARY KEY (id),
  CONSTRAINT nomor_darurat_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);