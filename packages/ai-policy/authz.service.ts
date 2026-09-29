import { Injectable } from '@nestjs/common';
import { AiRole, PolicyContext } from './policy.types.js';

@Injectable()
export class AuthzService {
  hasPermission(
    role: AiRole,
    permission: string,
  ): boolean {
    const permissions: Record<AiRole, string[]> = {
      viewer: [
        'read',
      ],

      operator: [
        'read',
        'incident:create',
      ],

      admin: [
        'read',
        'incident:create',
        'deploy:trigger',
      ],
    };

    return permissions[role]?.includes(permission) ?? false;
  }
}