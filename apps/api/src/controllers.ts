import {
  BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, HttpException, Param, Patch, Post,
  Query, Req, Res, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { MODULES, isModuleKey, type ModuleKey } from './catalog';
import { canAccessModule } from './policy';
import { Public } from './guards';
import { AuthService } from './auth.service';
import { hashSessionToken } from './auth-crypto';
import { RateLimitService } from './rate-limit.service';
import { parseLoginInput, parsePagination, parseRecordInput } from './validation';
import { RecordsService } from './records.service';
import { DashboardService } from './dashboard.service';
import type { AuthenticatedRequest } from './types';
import { SpecialistService } from './specialist.service';

function checkedModule(value: string): ModuleKey {
  if (!isModuleKey(value)) throw new NotFoundException('Workspace not found.');
  return value;
}

function checkedId(value: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new BadRequestException('Invalid record ID.');
  }
  return value;
}

@Controller('v1')
export class AppController {
  constructor(
    private readonly auth: AuthService,
    private readonly limiter: RateLimitService,
    private readonly records: RecordsService,
    private readonly dashboard: DashboardService,
    private readonly specialists: SpecialistService,
  ) {}

  @Public()
  @Get('health')
  health() { return { status: 'ok' }; }

  @Public()
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const input = parseLoginInput(body);
    // The request IP and X-Forwarded-For are intentionally ignored: a client can forge them through an upstream proxy.
    void request;
    const [accountAllowed, globalAllowed] = await Promise.all([
      this.limiter.check(`login:account:${hashSessionToken(input.email)}`, 8, 900),
      this.limiter.check('login:global', 300, 60),
    ]);
    if (!accountAllowed || !globalAllowed) throw new HttpException('Too many login attempts. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    const { token, user } = await this.auth.login(input);
    response.cookie('pd_session', token, {
      httpOnly: true, secure: (process.env.PUBLIC_APP_ORIGIN ?? '').startsWith('https://'),
      sameSite: 'lax', path: '/', maxAge: 12 * 60 * 60 * 1000,
    });
    return { user };
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(request.cookies?.pd_session);
    response.clearCookie('pd_session', { path: '/', sameSite: 'lax', secure: (process.env.PUBLIC_APP_ORIGIN ?? '').startsWith('https://') });
    return { ok: true };
  }

  @Get('me')
  me(@Req() request: AuthenticatedRequest) { return { user: request.user }; }

  @Get('modules')
  modules(@Req() request: AuthenticatedRequest) {
    return { modules: MODULES.filter((module) => canAccessModule(request.user.role, module.key)) };
  }

  @Get('dashboard')
  overview(@Req() request: AuthenticatedRequest) { return this.dashboard.overview(request.user); }

  @Get('modules/:moduleKey/records')
  list(@Req() request: AuthenticatedRequest, @Param('moduleKey') key: string, @Query() query: Record<string, unknown>) {
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    if (search.length > 100) throw new BadRequestException('Search must be at most 100 characters.');
    return this.records.list(request.user, checkedModule(key), parsePagination(query), search);
  }

  @Get('modules/:moduleKey/records/:id')
  get(@Req() request: AuthenticatedRequest, @Param('moduleKey') key: string, @Param('id') id: string) {
    return this.records.get(request.user, checkedModule(key), checkedId(id));
  }

  @Post('modules/:moduleKey/records')
  create(@Req() request: AuthenticatedRequest, @Param('moduleKey') key: string, @Body() body: unknown) {
    return this.records.create(request.user, checkedModule(key), parseRecordInput(body));
  }

  @Patch('modules/:moduleKey/records/:id')
  update(@Req() request: AuthenticatedRequest, @Param('moduleKey') key: string, @Param('id') id: string, @Body() body: unknown) {
    return this.records.update(request.user, checkedModule(key), checkedId(id), parseRecordInput(body));
  }

  @Post('modules/bpm/records/:id/transition')
  transition(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    if (!body || typeof body !== 'object' || !('status' in body) || !['submitted', 'approved', 'rejected'].includes(String(body.status))) {
      throw new BadRequestException('A valid target status is required.');
    }
    return this.records.transition(request.user, checkedId(id), (body as { status: 'submitted' | 'approved' | 'rejected' }).status);
  }

  @Post('intelligence/summary')
  async summary(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    if (!canAccessModule(request.user.role, 'bi') || request.user.role === 'viewer') throw new ForbiddenException();
    return this.specialists.summary(body);
  }

  @Get('geo/distance')
  distance(@Req() request: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    if (!canAccessModule(request.user.role, 'geo')) throw new ForbiddenException();
    return this.specialists.distance(query);
  }
}
