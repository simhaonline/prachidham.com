import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { isTrustedOrigin, parseAllowedOrigins } from './auth-crypto';
import type { AuthenticatedRequest } from './types';

export const Public = () => SetMetadata('public', true);

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = await this.auth.authenticate(request.cookies?.pd_session);
    return true;
  }
}

@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;
    // A split-domain deployment serves the public site and the staff console on
    // different hostnames, so more than one origin may legitimately mutate data.
    const allowed = parseAllowedOrigins(process.env.PUBLIC_ALLOWED_ORIGINS, process.env.PUBLIC_APP_ORIGIN ?? 'http://localhost:3000');
    return isTrustedOrigin(request.get('origin'), allowed);
  }
}
