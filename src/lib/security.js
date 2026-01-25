/**
 * Security utilities for input validation and sanitization
 * Implements OWASP Top 10:2025 best practices
 */

// Valid city IDs based on the cities configuration
// SECURITY: Whitelist approach to prevent NoSQL injection via collection names
const VALID_CITY_IDS = [
  // 2024 cities
  'dublin', 'newry', 'london', 'belfast', 'liverpool', 'newyork', 'chicago',
  // 2025 cities
  'birmingham', 'manchester', 'leeds', 'malahide', 'naas', 'maynooth',
  'muharraq', 'rabat', 'galway', 'delhi', 'raipur', 'nagpur', 'bengaluru', 'newquay',
  // Add future cities here
];

/**
 * Validates if a city ID is in the allowed whitelist
 * OWASP A03:2025 - Injection Prevention
 *
 * @param {string} cityId - The city ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidCityId(cityId) {
  if (!cityId || typeof cityId !== 'string') {
    return false;
  }

  // Normalize to lowercase and trim
  const normalized = cityId.toLowerCase().trim();

  // Check against whitelist
  return VALID_CITY_IDS.includes(normalized);
}

/**
 * Validates and sanitizes a city ID, throwing an error if invalid
 *
 * @param {string} cityId - The city ID to validate
 * @throws {Error} - If city ID is invalid
 * @returns {string} - The normalized city ID
 */
export function validateCityId(cityId) {
  if (!isValidCityId(cityId)) {
    throw new Error('Invalid city identifier');
  }
  return cityId.toLowerCase().trim();
}

/**
 * Validates coordinate values
 * OWASP A03:2025 - Injection Prevention
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - True if valid
 */
export function isValidCoordinates(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Sanitizes user input to prevent XSS
 * OWASP A03:2025 - Injection Prevention
 *
 * @param {string} input - User input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input, maxLength = 500) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Remove potentially dangerous HTML/script tags (basic sanitization)
  // For comprehensive XSS protection, use DOMPurify on client-side
  sanitized = sanitized
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
    .replace(/javascript:/gi, '');

  return sanitized;
}

/**
 * Validates email format
 *
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email regex (not perfect but good enough for validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates password strength
 * OWASP A07:2025 - Authentication Failures Prevention
 *
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  // Minimum 8 characters
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Maximum 128 characters (prevent DoS)
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Require at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Require at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Require at least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Require at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Rate limiter for preventing brute force attacks
 * OWASP A07:2025 - Authentication Failures Prevention
 *
 * Uses in-memory storage (consider Redis for production/distributed systems)
 */
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if identifier has exceeded rate limit
   *
   * @param {string} identifier - Unique identifier (IP, email, etc.)
   * @returns {object} - { allowed: boolean, remainingAttempts: number, resetTime: Date }
   */
  checkLimit(identifier) {
    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, resetTime: now + this.windowMs };

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }

    if (record.count >= this.maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(record.resetTime)
      };
    }

    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - record.count,
      resetTime: new Date(record.resetTime)
    };
  }

  /**
   * Record an attempt
   *
   * @param {string} identifier - Unique identifier
   */
  recordAttempt(identifier) {
    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, resetTime: now + this.windowMs };

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + this.windowMs;
    } else {
      record.count++;
    }

    this.attempts.set(identifier, record);
  }

  /**
   * Reset attempts for an identifier (e.g., after successful login)
   *
   * @param {string} identifier - Unique identifier
   */
  reset(identifier) {
    this.attempts.delete(identifier);
  }

  /**
   * Clean up old entries (call periodically to prevent memory leaks)
   */
  cleanup() {
    const now = Date.now();
    for (const [identifier, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(identifier);
      }
    }
  }
}

// Export singleton instance for login rate limiting
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => loginRateLimiter.cleanup(), 60 * 60 * 1000);
}

/**
 * Validates MongoDB ObjectId format
 *
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export function isValidObjectId(id) {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // MongoDB ObjectId is 24 character hex string
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize input for use in prompts to LLMs (OpenAI, etc.)
 * OWASP A03:2025 - Injection Prevention (Prompt Injection)
 *
 * @param {string} input - User input to sanitize
 * @param {number} maxLength - Maximum length
 * @returns {string} - Sanitized input
 */
export function sanitizePromptInput(input, maxLength = 2000) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim().slice(0, maxLength);

  // Remove system instruction injection attempts
  const dangerousPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /ignore\s+all\s+previous/gi,
    /forget\s+previous/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /\[SYSTEM\]/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
  ];

  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
}
