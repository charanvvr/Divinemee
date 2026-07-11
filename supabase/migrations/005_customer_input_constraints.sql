-- Enforce customer-controlled field limits for direct PostgREST writes.
-- NOT VALID avoids rejecting deployment because of unknown legacy rows while
-- still enforcing each constraint for all new and updated records.

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_length
    CHECK (full_name IS NULL OR char_length(btrim(full_name)) BETWEEN 2 AND 100) NOT VALID,
  ADD CONSTRAINT profiles_phone_format
    CHECK (phone IS NULL OR phone ~ '^\+91[6-9][0-9]{9}$') NOT VALID;

ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'IN';

ALTER TABLE public.addresses
  ADD CONSTRAINT addresses_label_length
    CHECK (char_length(btrim(label)) BETWEEN 1 AND 40) NOT VALID,
  ADD CONSTRAINT addresses_full_name_length
    CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 100) NOT VALID,
  ADD CONSTRAINT addresses_phone_format
    CHECK (replace(replace(phone, ' ', ''), '-', '') ~ '^(\+91|91)?[6-9][0-9]{9}$') NOT VALID,
  ADD CONSTRAINT addresses_house_length
    CHECK (char_length(btrim(house)) BETWEEN 1 AND 150) NOT VALID,
  ADD CONSTRAINT addresses_street_length
    CHECK (street IS NULL OR char_length(street) <= 150) NOT VALID,
  ADD CONSTRAINT addresses_area_length
    CHECK (area IS NULL OR char_length(area) <= 100) NOT VALID,
  ADD CONSTRAINT addresses_city_length
    CHECK (char_length(btrim(city)) BETWEEN 2 AND 80) NOT VALID,
  ADD CONSTRAINT addresses_state_length
    CHECK (char_length(btrim(state)) BETWEEN 2 AND 80) NOT VALID,
  ADD CONSTRAINT addresses_indian_state
    CHECK (state IN (
      'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
      'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
      'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
      'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
      'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
      'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    )) NOT VALID,
  ADD CONSTRAINT addresses_indian_pin
    CHECK (pin_code ~ '^[1-9][0-9]{5}$') NOT VALID,
  ADD CONSTRAINT addresses_country_india
    CHECK (country = 'IN') NOT VALID;
