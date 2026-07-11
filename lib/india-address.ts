export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const INDIAN_MOBILE_HTML_PATTERN = '(?:\\+91 ?|91 ?)?[6-9][0-9]{9}';
export const INDIAN_PIN_HTML_PATTERN = '[1-9][0-9]{5}';

export function normalizeIndianMobile(value: string) {
  const compact = value.trim().replace(/[ -]/g, '');
  if (/^[6-9][0-9]{9}$/.test(compact)) return `+91${compact}`;
  if (/^91[6-9][0-9]{9}$/.test(compact)) return `+${compact}`;
  return compact;
}

export function isIndianMobile(value: string) {
  return /^\+91[6-9][0-9]{9}$/.test(normalizeIndianMobile(value));
}

export function isIndianPin(value: string) {
  return /^[1-9][0-9]{5}$/.test(value.trim());
}
