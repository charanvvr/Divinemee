-- P1 FIX (2026-07-11 pre-launch audit)
-- Migration 005 added profiles_full_name_length CHECK (length BETWEEN 2 AND 100),
-- but handle_new_user() inserts full_name = '' (empty string) whenever a signup
-- carries no name metadata (and the register form allowed 1-char names). Empty/
-- short strings violate the constraint, so the AFTER INSERT trigger aborts the
-- auth.users insert -> the whole signup fails. This broke email signups without a
-- name and any 1-char name.
--
-- Fix: (1) make the trigger sanitise the value so a profile row is always valid
-- (trim, cap at 100 chars, empty -> NULL), and (2) relax the lower bound to 1 so
-- a short display name can never block account creation. Delivery-critical name
-- validation still lives on addresses.full_name (>= 2) and the checkout schema.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NULLIF(left(btrim(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')), 100), ''),
    NULLIF(left(COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', ''), 1000), '')
  );
  RETURN NEW;
END;
$$;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_full_name_length;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_length
    CHECK (full_name IS NULL OR char_length(btrim(full_name)) BETWEEN 1 AND 100) NOT VALID;
