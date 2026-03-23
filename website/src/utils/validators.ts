export const validators = {
  email: (value: string): string | null => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email address';
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  required: (value: string, fieldName = 'This field'): string | null => {
    if (!value || !value.trim()) return `${fieldName} is required`;
    return null;
  },

  minLength: (value: string, min: number, fieldName = 'This field'): string | null => {
    if (!value || value.length < min) return `${fieldName} must be at least ${min} characters`;
    return null;
  },

  maxLength: (value: string, max: number, fieldName = 'This field'): string | null => {
    if (value && value.length > max) return `${fieldName} must be at most ${max} characters`;
    return null;
  },

  phone: (value: string): string | null => {
    if (!value) return null;
    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!phoneRegex.test(value)) return 'Invalid phone number';
    return null;
  },

  url: (value: string): string | null => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL';
    }
  },

  match: (value: string, matchValue: string, fieldName = 'This field'): string | null => {
    if (value !== matchValue) return `${fieldName} does not match`;
    return null;
  },
};

export function validateForm(
  data: Record<string, string>,
  rules: Record<string, ((value: string) => string | null)[]>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field] || '';
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
}

export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
