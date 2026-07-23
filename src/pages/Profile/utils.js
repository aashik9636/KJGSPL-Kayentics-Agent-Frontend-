// ─── Constants & Master Data ──────────────────────────────────────────────────
export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'SGD', label: 'SGD ($)' },
  { value: 'AED', label: 'AED (د.إ)' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

export const TIMEZONES = Intl.supportedValuesOf('timeZone').map(tz => ({ value: tz, label: tz }));

// ─── Validation Helpers ────────────────────────────────────────────────────────
export const isValidUrl = (str) => !str || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(str);
export const isValidEmail = (str) => !str || /^\S+@\S+\.\S+$/.test(str);
export const isValidPhone = (str) => !str || /^\+?[0-9\s\-\(\)]+$/.test(str);

export const validateProfile = (data) => {
  const errors = {};
  if (!data.firstName?.trim()) errors.firstName = "First name is required";
  if (!data.lastName?.trim()) errors.lastName = "Last name is required";
  if (data.phone && !isValidPhone(data.phone)) errors.phone = "Invalid phone format";
  return errors;
};

export const validateBusiness = (data) => {
  const errors = {};
  if (!data.companyName?.trim()) errors.companyName = "Company name is required";
  if (!isValidUrl(data.website)) errors.website = "Must be a valid URL (https://...)";
  if (!isValidEmail(data.email)) errors.email = "Must be a valid email address";
  if (!isValidPhone(data.phone)) errors.phone = "Invalid phone format";
  if (data.foundedYear && (data.foundedYear < 1800 || data.foundedYear > new Date().getFullYear())) errors.foundedYear = "Must be a valid year";
  return errors;
};

// ─── Select Styles (Vercel/Linear-esque) ──────────────────────────────────────
export const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    borderRadius: '0.5rem',
    backgroundColor: '#ffffff',
    border: state.isFocused ? '1px solid #111827' : '1px solid #e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(17, 24, 39, 0.05)' : '0 1px 2px rgba(0,0,0,0.02)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': { borderColor: state.isFocused ? '#111827' : '#d1d5db' },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#111827' : state.isFocused ? '#f9fafb' : 'white',
    color: state.isSelected ? 'white' : '#111827',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 12px',
    '&:active': { backgroundColor: '#f3f4f6' }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    overflow: 'hidden',
    zIndex: 50,
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  }),
};
