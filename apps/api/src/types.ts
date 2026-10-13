import type { Request } from 'express';
import type { Role } from './policy';

export type RequestUser = {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  displayName: string;
  role: Role;
};

export type AuthenticatedRequest = Request & { user: RequestUser };

export type RecordRow = {
  id: string;
  module_key: string;
  title: string;
  status: string;
  data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
};
