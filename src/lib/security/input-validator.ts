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
export function validateChatRequest(body: any): ValidationResult<{
  messages: any[];
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

  // Validate messages
  if (!('messages' in body)) {
    errors.push({ field: 'messages', message: 'messages field is required' });
  } else if (!Array.isArray(body.messages)) {
    errors.push({ field: 'messages', message: 'messages must be an array' });
  } else {
    // Validate each message structure to prevent malformed injections
    body.messages.forEach((msg: any, i: number) => {
      if (!msg || typeof msg !== 'object') {
        errors.push({ field: `messages[${i}]`, message: 'message must be an object' });
        return;
      }
      if (typeof msg.role !== 'string' || !['user', 'assistant', 'system'].includes(msg.role)) {
        errors.push({
          field: `messages[${i}].role`,
          message: 'role must be user, assistant, or system',
        });
      }
      // Vercel AI SDK messages can have content or parts
      if ('content' in msg && typeof msg.content !== 'string') {
        errors.push({ field: `messages[${i}].content`, message: 'content must be a string' });
      }
      if ('parts' in msg && !Array.isArray(msg.parts)) {
        errors.push({ field: `messages[${i}].parts`, message: 'parts must be an array' });
      }
    });
  }

  // Optional string validation with length capping
  const checkOptionalString = (field: string, maxLen = 500) => {
    if (field in body && body[field] !== undefined && body[field] !== null) {
      if (typeof body[field] !== 'string') {
        errors.push({ field, message: `${field} must be a string` });
      } else if (body[field].length > maxLen) {
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
  if ('needs' in body && body.needs !== undefined && body.needs !== null) {
    if (!Array.isArray(body.needs)) {
      errors.push({ field: 'needs', message: 'needs must be an array of strings' });
    } else {
      body.needs.forEach((need: any, i: number) => {
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
      messages: body.messages,
      fanId: body.fanId ? sanitizeString(body.fanId, 100) : undefined,
      volunteerId: body.volunteerId ? sanitizeString(body.volunteerId, 100) : undefined,
      stadiumId: body.stadiumId ? sanitizeString(body.stadiumId, 100) : undefined,
      mode: body.mode ? sanitizeString(body.mode, 50) : undefined,
      needs: body.needs ? body.needs.map((n: string) => sanitizeString(n, 100)) : undefined,
      origin: body.origin ? sanitizeString(body.origin, 200) : undefined,
      kickoffTime: body.kickoffTime ? sanitizeString(body.kickoffTime, 10) : undefined,
      image: body.image, // Base64 raw image
    },
  };
}

/**
 * Validates scenario trigger payloads
 */
export function validateScenarioRequest(body: any): ValidationResult<{ scenario: string }> {
  if (!body || typeof body !== 'object') {
    return {
      success: false,
      errors: [{ field: 'body', message: 'Request body must be a valid JSON object' }],
    };
  }

  if (!('scenario' in body)) {
    return {
      success: false,
      errors: [{ field: 'scenario', message: 'scenario field is required' }],
    };
  }

  if (typeof body.scenario !== 'string') {
    return {
      success: false,
      errors: [{ field: 'scenario', message: 'scenario must be a string' }],
    };
  }

  const allowed = ['thunderstorm', 'medical', 'vip'];
  if (!allowed.includes(body.scenario)) {
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
      scenario: body.scenario,
    },
  };
}

/**
 * Validates reroute request payloads
 */
export function validateRerouteRequest(body: any): ValidationResult<{
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

  if (!('gateId' in body)) {
    errors.push({ field: 'gateId', message: 'gateId field is required' });
  } else if (typeof body.gateId !== 'string') {
    errors.push({ field: 'gateId', message: 'gateId must be a string' });
  }

  if (!('action' in body)) {
    errors.push({ field: 'action', message: 'action field is required' });
  } else if (body.action !== 'open' && body.action !== 'close') {
    errors.push({ field: 'action', message: "action must be either 'open' or 'close'" });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      gateId: sanitizeString(body.gateId, 100),
      action: body.action as 'open' | 'close',
    },
  };
}
