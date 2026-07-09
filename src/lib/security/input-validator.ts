import type { UIMessage } from 'ai';

type ChatRole = 'user' | 'assistant' | 'system';

export interface SecureMessage {
  role: ChatRole;
  parts: Omit<UIMessage, 'id'>['parts'];
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
export function sanitizeString(val: unknown, maxLength = 2000): string {
  if (typeof val !== 'string' || val.length === 0) return '';
  return val
    .trim()
    .slice(0, maxLength)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isChatRole(value: unknown): value is ChatRole {
  return value === 'user' || value === 'assistant' || value === 'system';
}

function sanitizeMessageParts(msgObj: Record<string, unknown>): SecureMessage['parts'] {
  if (Array.isArray(msgObj.parts)) {
    return msgObj.parts.flatMap((part): SecureMessage['parts'] => {
      if (!part || typeof part !== 'object') return [];
      const partObj = part as Record<string, unknown>;

      if (partObj.type === 'text' && typeof partObj.text === 'string') {
        return [{ type: 'text', text: sanitizeString(partObj.text) }];
      }

      return [];
    });
  }

  if (typeof msgObj.content === 'string') {
    return [{ type: 'text', text: sanitizeString(msgObj.content) }];
  }

  return [];
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
  const sanitizedMessages: SecureMessage[] = [];

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
    obj.messages.forEach((msg: unknown, i: number) => {
      if (!msg || typeof msg !== 'object') {
        errors.push({ field: `messages[${i}]`, message: 'message must be an object' });
        return;
      }
      const msgObj = msg as Record<string, unknown>;
      if (!isChatRole(msgObj.role)) {
        errors.push({
          field: `messages[${i}].role`,
          message: 'role must be user, assistant, or system',
        });
        return;
      }

      if ('content' in msgObj && msgObj.content !== undefined && typeof msgObj.content !== 'string') {
        errors.push({ field: `messages[${i}].content`, message: 'content must be a string' });
      }
      if ('parts' in msgObj && !Array.isArray(msgObj.parts)) {
        errors.push({ field: `messages[${i}].parts`, message: 'parts must be an array' });
        return;
      }

      const parts = sanitizeMessageParts(msgObj);
      if (parts.length === 0) {
        errors.push({
          field: `messages[${i}].parts`,
          message: 'message must include at least one text part',
        });
        return;
      }

      sanitizedMessages.push({ role: msgObj.role, parts });
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

  const sanitizedNeeds = Array.isArray(obj.needs)
    ? obj.needs.map((need) => sanitizeString(need, 100))
    : undefined;

  // Return sanitized copy of strings
  return {
    success: true,
    data: {
      messages: sanitizedMessages,
      fanId: obj.fanId ? sanitizeString(obj.fanId, 100) : undefined,
      volunteerId: obj.volunteerId ? sanitizeString(obj.volunteerId, 100) : undefined,
      stadiumId: obj.stadiumId ? sanitizeString(obj.stadiumId, 100) : undefined,
      mode: obj.mode ? sanitizeString(obj.mode, 50) : undefined,
      needs: sanitizedNeeds,
      origin: obj.origin ? sanitizeString(obj.origin, 200) : undefined,
      kickoffTime: obj.kickoffTime ? sanitizeString(obj.kickoffTime, 10) : undefined,
      image: typeof obj.image === 'string' ? obj.image : undefined, // Base64 raw image
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
      gateId: sanitizeString(obj.gateId, 100),
      action: obj.action === 'open' ? 'open' : 'close',
    },
  };
}
