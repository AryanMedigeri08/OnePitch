export interface SecureMessage {
  role: 'user' | 'assistant' | 'system';
  content?: string;
  parts?: unknown[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Sanitizes input to prevent basic HTML/Script injection.
 */
export function sanitizeString(val: string, maxLength = 2000): string {
  if (!val) return '';
  return val
    .trim()
    .slice(0, maxLength)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Validates chat request payloads
 */
export function validateChatRequest(body: unknown): ValidationResult<{
  messages: SecureMessage[];
  fanId?: string;
  volunteerId?: string;
  stadiumId?: string;
  mode?: string;
  needs?: string[];
  origin?: string;
  kickoffTime?: string;
  image?: string;
}> {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return {
      success: false,
      errors: [{ field: 'body', message: 'Request body must be a valid JSON object' }],
    };
  }

  const obj = body as Record<string, unknown>;

  // Validate messages
  if (!('messages' in obj)) {
    errors.push({ field: 'messages', message: 'messages field is required' });
  } else if (!Array.isArray(obj.messages)) {
    errors.push({ field: 'messages', message: 'messages must be an array' });
  } else {
    // Validate each message structure to prevent malformed injections
    (obj.messages as unknown[]).forEach((msg: unknown, i: number) => {
      if (!msg || typeof msg !== 'object') {
        errors.push({ field: `messages[${i}]`, message: 'message must be an object' });
        return;
      }
      const msgObj = msg as Record<string, unknown>;
      if (typeof msgObj.role !== 'string' || !['user', 'assistant', 'system'].includes(msgObj.role)) {
        errors.push({
          field: `messages[${i}].role`,
          message: 'role must be user, assistant, or system',
        });
      }
      // Vercel AI SDK messages can have content or parts
      if ('content' in msgObj && typeof msgObj.content !== 'string') {
        errors.push({ field: `messages[${i}].content`, message: 'content must be a string' });
      }
      if ('parts' in msgObj && !Array.isArray(msgObj.parts)) {
        errors.push({ field: `messages[${i}].parts`, message: 'parts must be an array' });
      }
    });
  }

  // Optional string validation with length capping
  const checkOptionalString = (field: string, maxLen = 500) => {
    if (field in obj && obj[field] !== undefined && obj[field] !== null) {
      if (typeof obj[field] !== 'string') {
        errors.push({ field, message: `${field} must be a string` });
      } else if ((obj[field] as string).length > maxLen) {
        errors.push({ field, message: `${field} length exceeds ${maxLen} limit` });
      }
    }
  };

  checkOptionalString('fanId', 100);
  checkOptionalString('volunteerId', 100);
  checkOptionalString('stadiumId', 100);
  checkOptionalString('mode', 50);
  checkOptionalString('origin', 200);
  checkOptionalString('kickoffTime', 10);
  checkOptionalString('image', 10 * 1024 * 1024); // Support base64 image strings up to 10MB

  // Needs validation
  if ('needs' in obj && obj.needs !== undefined && obj.needs !== null) {
    if (!Array.isArray(obj.needs)) {
      errors.push({ field: 'needs', message: 'needs must be an array of strings' });
    } else {
      (obj.needs as unknown[]).forEach((need: unknown, i: number) => {
        if (typeof need !== 'string') {
          errors.push({ field: `needs[${i}]`, message: 'each accessibility need must be a string' });
        }
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Return sanitized copy of strings
  return {
    success: true,
    data: {
      messages: obj.messages as SecureMessage[],
      fanId: obj.fanId ? sanitizeString(obj.fanId as string, 100) : undefined,
      volunteerId: obj.volunteerId ? sanitizeString(obj.volunteerId as string, 100) : undefined,
      stadiumId: obj.stadiumId ? sanitizeString(obj.stadiumId as string, 100) : undefined,
      mode: obj.mode ? sanitizeString(obj.mode as string, 50) : undefined,
      needs: obj.needs ? (obj.needs as string[]).map((n: string) => sanitizeString(n, 100)) : undefined,
      origin: obj.origin ? sanitizeString(obj.origin as string, 200) : undefined,
      kickoffTime: obj.kickoffTime ? sanitizeString(obj.kickoffTime as string, 10) : undefined,
      image: obj.image as string | undefined, // Base64 raw image
    },
  };
}

/**
 * Validates scenario trigger payloads
 */
export function validateScenarioRequest(body: unknown): ValidationResult<{ scenario: string }> {
  if (!body || typeof body !== 'object') {
    return {
      success: false,
      errors: [{ field: 'body', message: 'Request body must be a valid JSON object' }],
    };
  }

  const obj = body as Record<string, unknown>;

  if (!('scenario' in obj)) {
    return {
      success: false,
      errors: [{ field: 'scenario', message: 'scenario field is required' }],
    };
  }

  if (typeof obj.scenario !== 'string') {
    return {
      success: false,
      errors: [{ field: 'scenario', message: 'scenario must be a string' }],
    };
  }

  const allowed = ['thunderstorm', 'medical', 'vip'];
  if (!allowed.includes(obj.scenario)) {
    return {
      success: false,
      errors: [
        {
          field: 'scenario',
          message: `scenario must be one of: ${allowed.join(', ')}`,
        },
      ],
    };
  }

  return {
    success: true,
    data: {
      scenario: obj.scenario,
    },
  };
}

/**
 * Validates reroute request payloads
 */
export function validateRerouteRequest(body: unknown): ValidationResult<{
  gateId: string;
  action: 'open' | 'close';
}> {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return {
      success: false,
      errors: [{ field: 'body', message: 'Request body must be a valid JSON object' }],
    };
  }

  const obj = body as Record<string, unknown>;

  if (!('gateId' in obj)) {
    errors.push({ field: 'gateId', message: 'gateId field is required' });
  } else if (typeof obj.gateId !== 'string') {
    errors.push({ field: 'gateId', message: 'gateId must be a string' });
  }

  if (!('action' in obj)) {
    errors.push({ field: 'action', message: 'action field is required' });
  } else if (obj.action !== 'open' && obj.action !== 'close') {
    errors.push({ field: 'action', message: "action must be either 'open' or 'close'" });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      gateId: sanitizeString(obj.gateId as string, 100),
      action: obj.action as 'open' | 'close',
    },
  };
}
