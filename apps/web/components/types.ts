export type UserRole = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer' | string;

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  organizationName: string;
  role: UserRole;
}

export interface ModuleDefinition {
  key: string;
  name: string;
  description: string;
  group: string;
}

export interface ModuleCount {
  key: string;
  count: number;
}

export interface RecentRecord {
  id: string;
  moduleKey: string;
  title: string;
  status: string;
  updatedAt: string;
}

export interface DashboardData {
  totalRecords: number;
  modules: ModuleCount[];
  recent: RecentRecord[];
}

export interface RecordData {
  [key: string]: unknown;
}

export interface WorkspaceRecord {
  id: string;
  moduleKey: string;
  title: string;
  status: string;
  data: RecordData;
  createdAt: string;
  updatedAt: string;
}

export interface RecordPage {
  data: WorkspaceRecord[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}
