import { Injectable } from '@nestjs/common';

import { ToolSecurityService } from '../tools/tool-security.service.js';
import { AuthzService } from './authz.service.js';
import {
  PolicyContext,
  PolicyDecision,
} from './policy.types.js';

@Injectable()
export class PolicyService {
  constructor(
    private readonly toolSecurityService: ToolSecurityService,
    private readonly authzService: AuthzService,
  ) {}

  evaluate(
    context: PolicyContext,
  ): PolicyDecision {
    const contract =
      this.toolSecurityService.getContract(
        context.toolName,
      );

    const allowed =
      this.authzService.hasPermission(
        context.role,
        contract.permission,
      );

    if (!allowed) {
      return 'DENY';
    }

    if (contract.requiresApproval) {
      return 'REQUIRE_APPROVAL';
    }

    return 'ALLOW';
  }
}