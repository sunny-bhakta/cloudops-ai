import type {
  AiRequestContext,
} from '@cloudops/ai-contracts';

export function createAiRequestContext(
  requestId: string | undefined,
  role: string | undefined,
): AiRequestContext {
  return {
    requestId:
      requestId?.trim() ||
      crypto.randomUUID(),

    role: normalizeRole(role),
  };
}

function normalizeRole(
  role: string | undefined,
): AiRequestContext['role'] {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'admin';

    case 'viewer':
      return 'viewer';

    case 'operator':
    default:
      return 'operator';
  }
}
