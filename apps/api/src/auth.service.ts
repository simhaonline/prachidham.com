import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { Database } from './database';
import { hashSessionToken, newSessionToken } from './auth-crypto';
import type { LoginInput } from './validation';
import type { RequestUser } from './types';

const SESSION_HOURS = 12;

type UserRow = RequestUser & { password_hash: string };

@Injectable()
export class AuthService {
  constructor(private readonly db: Database) {}

  async login(input: LoginInput): Promise<{ token: string; user: RequestUser }> {
    const result = await this.db.query<UserRow>(`
      SELECT u.id, u.organization_id AS "organizationId", o.name AS "organizationName",
             u.email, u.display_name AS "displayName", u.role, u.password_hash
      FROM users u JOIN organizations o ON o.id = u.organization_id
      WHERE u.email = $1 AND u.is_active = true
    `, [input.email]);
    const row = result.rows[0];
    if (!row || !(await compare(input.password, row.password_hash))) {
      throw new UnauthorizedException('The email or password is incorrect.');
    }
    const token = newSessionToken();
    await this.db.query(`
      INSERT INTO sessions (token_hash, user_id, expires_at)
      VALUES ($1, $2, now() + ($3 || ' hours')::interval)
    `, [hashSessionToken(token), row.id, SESSION_HOURS]);
    const { password_hash: _passwordHash, ...user } = row;
    return { token, user };
  }

  async authenticate(token: string | undefined): Promise<RequestUser> {
    if (!token) throw new UnauthorizedException('Authentication is required.');
    const result = await this.db.query<RequestUser>(`
      SELECT u.id, u.organization_id AS "organizationId", o.name AS "organizationName",
             u.email, u.display_name AS "displayName", u.role
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      JOIN organizations o ON o.id = u.organization_id
      WHERE s.token_hash = $1 AND s.expires_at > now() AND u.is_active = true
    `, [hashSessionToken(token)]);
    if (!result.rows[0]) throw new UnauthorizedException('The session is invalid or expired.');
    return result.rows[0];
  }

  async logout(token: string | undefined): Promise<void> {
    if (token) await this.db.query('DELETE FROM sessions WHERE token_hash = $1', [hashSessionToken(token)]);
  }
}
