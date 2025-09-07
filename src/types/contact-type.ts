export interface IContact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  adminNotes?: string;
  respondedBy?: string;
  respondedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGetAllContactsRes {
  status: string;
  results: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: IContact[];
}

export interface IContactStats {
  status: string;
  data: {
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byPriority: {
      high: number;
      medium: number;
      low: number;
    };
    unread: number;
  };
}

export interface IUpdateContactRes {
  status: string;
  message: string;
  data: IContact;
}

export interface IDeleteContactRes {
  status: string;
  message: string;
}

export interface IContactQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  isRead?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IContactUpdatePayload {
  status?: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  adminNotes?: string;
  isRead?: boolean;
}