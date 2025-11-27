/**
 * URL Validation and SSRF Protection
 * Prevents Server-Side Request Forgery attacks by validating image URLs
 */

/**
 * Allowed domains for image uploads
 * Only images from these domains can be processed
 */
const ALLOWED_IMAGE_DOMAINS = [
  // Vercel Blob Storage
  '7ku24g8oti06nmwx.public.blob.vercel-storage.com',
  'public.blob.vercel-storage.com',
  // TEMPORARY: For testing
  'randomuser.me',
  'upload.wikimedia.org',
  'images.unsplash.com',
  'images.pexels.com',
  'cdn.pixabay.com',
  // Add other trusted CDNs here as needed
  // 'your-cdn.com',
] as const;

const ALLOWED_PROTOCOLS = ['https:'] as const;

/**
 * Blocked patterns (SSRF prevention)
 */
const BLOCKED_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^192\.168\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^::1$/,
  /^0\.0\.0\.0$/,
  /^169\.254\./, // Link-local
  /^metadata\.google\.internal$/i, // Cloud metadata endpoints
  /^169\.254\.169\.254$/, // AWS metadata
];

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  sanitizedUrl?: string;
}

/**
 * Validate image URL against security rules
 * Prevents SSRF attacks and ensures only trusted sources
 */
export function validateImageUrl(url: string): UrlValidationResult {
  try {
    // Parse URL
    const parsed = new URL(url);

    const isProd = process.env.NODE_ENV === 'production';

    // Check protocol - only HTTPS allowed (except in dev/local)
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol as any)) {
      if (isProd) {
        return {
          valid: false,
          error: `Invalid protocol: ${parsed.protocol}. Only HTTPS is allowed for security.`,
        };
      }
      // In non-prod, allow http for local testing
      if (parsed.protocol !== 'http:') {
        return {
          valid: false,
          error: `Invalid protocol: ${parsed.protocol}. Use http/https in non-production.`,
        };
      }
    }

    // Check for blocked patterns (SSRF prevention)
    if (isProd) {
      for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(parsed.hostname)) {
          return {
            valid: false,
            error: 'Private IP addresses and localhost are not allowed.',
          };
        }
      }
    }

    // Check domain whitelist
    if (isProd) {
      const isAllowedDomain = ALLOWED_IMAGE_DOMAINS.some(domain => {
        return parsed.hostname === domain ||
               parsed.hostname.endsWith(`.${domain}`);
      });

      if (!isAllowedDomain) {
        return {
          valid: false,
          error: `Image must be from allowed storage provider. Found: ${parsed.hostname}`,
        };
      }
    }

    // Additional checks for suspicious patterns
    if (parsed.username || parsed.password) {
      return {
        valid: false,
        error: 'URLs with authentication are not allowed.',
      };
    }

    // All checks passed
    return {
      valid: true,
      sanitizedUrl: parsed.toString(),
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format. Please provide a valid HTTPS URL.',
    };
  }
}

/**
 * Sanitize and validate image URL
 * Returns the sanitized URL or throws an error
 */
export function sanitizeImageUrl(url: string): string {
  const validation = validateImageUrl(url);

  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image URL');
  }

  return validation.sanitizedUrl!;
}

/**
 * Check if URL is from trusted domain (for additional validation)
 */
export function isTrustedDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_IMAGE_DOMAINS.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}
