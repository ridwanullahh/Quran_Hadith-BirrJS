/**
 * BirrStack Security & Form Sanitization.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Provides input validation, sanitization, and security utilities.
 */
/** Sanitize HTML to prevent XSS attacks. Escapes dangerous characters. */
export function sanitizeHtml(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
/** Strip all HTML tags from a string. */
export function stripHtml(input) {
    return input.replace(/<[^>]*>/g, '');
}
/** Validate an email address. */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/** Validate a URL. */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/** Validate a phone number (basic). */
export function isValidPhone(phone) {
    return /^\+?[\d\s\-()]{7,20}$/.test(phone);
}
/** Validate a strong password (min 8 chars, upper, lower, number). */
export function isStrongPassword(password) {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password);
}
/** Sanitize a string for safe use in SQL-like contexts (escape quotes). */
export function sanitizeSql(input) {
    return input.replace(/'/g, "''").replace(/;/g, '');
}
/** Truncate text to a maximum length. */
export function truncate(text, maxLen) {
    if (text.length <= maxLen)
        return text;
    return text.slice(0, maxLen - 3) + '...';
}
/** Generate a CSRF token. */
export function generateCSRFToken() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const arr = new Uint8Array(32);
        crypto.getRandomValues(arr);
        return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
/** Rate limiter — prevents too many calls in a time window. */
export class RateLimiter {
    maxCalls;
    windowMs;
    calls = [];
    constructor(maxCalls = 10, windowMs = 60000) {
        this.maxCalls = maxCalls;
        this.windowMs = windowMs;
    }
    /** Check if a call is allowed. Returns true if allowed, false if rate-limited. */
    canCall() {
        const now = Date.now();
        this.calls = this.calls.filter(t => now - t < this.windowMs);
        if (this.calls.length >= this.maxCalls)
            return false;
        this.calls.push(now);
        return true;
    }
    /** Get remaining calls in the current window. */
    remaining() {
        const now = Date.now();
        this.calls = this.calls.filter(t => now - t < this.windowMs);
        return Math.max(0, this.maxCalls - this.calls.length);
    }
}
/** Validate a form against a schema. */
export function validateForm(data, schema) {
    const errors = {};
    const cleaned = {};
    for (const [field, rules] of Object.entries(schema)) {
        let value = data[field];
        let strValue = typeof value === 'string' ? value : String(value ?? '');
        // Sanitize if requested
        if (rules.sanitize !== false) {
            strValue = sanitizeHtml(strValue);
        }
        // Required check
        if (rules.required && !strValue) {
            errors[field] = `${field} is required`;
            continue;
        }
        if (!strValue && !rules.required) {
            cleaned[field] = strValue;
            continue;
        }
        // Min/Max length
        if (rules.min !== undefined && strValue.length < rules.min) {
            errors[field] = `${field} must be at least ${rules.min} characters`;
            continue;
        }
        if (rules.max !== undefined && strValue.length > rules.max) {
            errors[field] = `${field} must be at most ${rules.max} characters`;
            continue;
        }
        // Pattern
        if (rules.pattern && !rules.pattern.test(strValue)) {
            errors[field] = `${field} format is invalid`;
            continue;
        }
        // Email
        if (rules.email && !isValidEmail(strValue)) {
            errors[field] = `${field} must be a valid email address`;
            continue;
        }
        // URL
        if (rules.url && !isValidUrl(strValue)) {
            errors[field] = `${field} must be a valid URL`;
            continue;
        }
        // Phone
        if (rules.phone && !isValidPhone(strValue)) {
            errors[field] = `${field} must be a valid phone number`;
            continue;
        }
        // Password strength
        if (rules.password && !isStrongPassword(strValue)) {
            errors[field] = `${field} must be at least 8 characters with upper, lower, and number`;
            continue;
        }
        cleaned[field] = strValue;
    }
    return { valid: Object.keys(errors).length === 0, errors, data: cleaned };
}
/** Content Security Policy header generator. */
export function generateCSP(options) {
    const defaults = ["'self'"];
    const scripts = options.scripts ?? defaults;
    const styles = options.styles ?? defaults;
    const images = options.images ?? [...defaults, 'data:', 'https:'];
    const connect = options.connect ?? defaults;
    const fonts = options.fonts ?? defaults;
    return [
        `default-src 'self'`,
        `script-src ${scripts.join(' ')}`,
        `style-src ${styles.join(' ')}`,
        `img-src ${images.join(' ')}`,
        `connect-src ${connect.join(' ')}`,
        `font-src ${fonts.join(' ')}`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `frame-ancestors 'none'`,
    ].join('; ');
}
//# sourceMappingURL=index.js.map