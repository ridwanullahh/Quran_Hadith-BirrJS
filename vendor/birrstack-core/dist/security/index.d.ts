/**
 * BirrStack Security & Form Sanitization.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Provides input validation, sanitization, and security utilities.
 */
/** Sanitize HTML to prevent XSS attacks. Escapes dangerous characters. */
export declare function sanitizeHtml(input: string): string;
/** Strip all HTML tags from a string. */
export declare function stripHtml(input: string): string;
/** Validate an email address. */
export declare function isValidEmail(email: string): boolean;
/** Validate a URL. */
export declare function isValidUrl(url: string): boolean;
/** Validate a phone number (basic). */
export declare function isValidPhone(phone: string): boolean;
/** Validate a strong password (min 8 chars, upper, lower, number). */
export declare function isStrongPassword(password: string): boolean;
/** Sanitize a string for safe use in SQL-like contexts (escape quotes). */
export declare function sanitizeSql(input: string): string;
/** Truncate text to a maximum length. */
export declare function truncate(text: string, maxLen: number): string;
/** Generate a CSRF token. */
export declare function generateCSRFToken(): string;
/** Rate limiter — prevents too many calls in a time window. */
export declare class RateLimiter {
    private maxCalls;
    private windowMs;
    private calls;
    constructor(maxCalls?: number, windowMs?: number);
    /** Check if a call is allowed. Returns true if allowed, false if rate-limited. */
    canCall(): boolean;
    /** Get remaining calls in the current window. */
    remaining(): number;
}
/** Validate and sanitize form data against a schema. */
export interface FieldValidation {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    email?: boolean;
    url?: boolean;
    phone?: boolean;
    password?: boolean;
    sanitize?: boolean;
}
export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
    data: Record<string, unknown>;
}
/** Validate a form against a schema. */
export declare function validateForm(data: Record<string, unknown>, schema: Record<string, FieldValidation>): ValidationResult;
/** Content Security Policy header generator. */
export declare function generateCSP(options: {
    scripts?: string[];
    styles?: string[];
    images?: string[];
    connect?: string[];
    fonts?: string[];
}): string;
//# sourceMappingURL=index.d.ts.map