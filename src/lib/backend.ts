import { apiFetch } from "@/lib/api";

export interface Role {
  id: string;
  name: string;
  description?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  max_hours?: number | string | null;
  academic_validation?: boolean;
}

export interface Participant {
  id?: string;
  name: string;
  ra: string;
  participated_at: string;
}

export interface Attachment {
  id: string;
  time_entry: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
  file: string;
  file_url: string;
}

export interface Approval {
  id?: string;
  status?: string;
  approved_by?: User | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface TimeEntry {
  id: string;
  user?: User | null;
  project: Project | string;
  project_id?: string;
  category: Category | string;
  category_id?: string;
  participants?: Participant[];
  attachments?: Attachment[];
  approvals?: Approval[];
  work_date: string;
  start_time: string;
  end_time: string;
  hours_worked: string | number;
  description: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface CalendarEvent {
  id: string;
  project: Project | string;
  project_id?: string;
  title: string;
  event_date: string;
  event_time: string;
  description?: string | null;
  created_by?: User | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const unwrapResults = <T>(response: PaginatedResponse<T> | T[]) => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.results ?? [];
};

export const login = async (email: string, password: string) => {
  return apiFetch<LoginResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const fetchCurrentUser = async () => {
  return apiFetch<User>("/api/auth/me/");
};

export const fetchProjects = async () => {
  return unwrapResults(await apiFetch<PaginatedResponse<Project> | Project[]>("/api/projects/"));
};

export const fetchCategories = async () => {
  return unwrapResults(await apiFetch<PaginatedResponse<Category> | Category[]>("/api/categories/"));
};

export const fetchMineTimeEntries = async () => {
  return unwrapResults(await apiFetch<PaginatedResponse<TimeEntry> | TimeEntry[]>("/api/time-entries/?mine=1"));
};

export const fetchAllTimeEntries = async () => {
  return unwrapResults(await apiFetch<PaginatedResponse<TimeEntry> | TimeEntry[]>("/api/time-entries/"));
};

export const createTimeEntry = async (payload: {
  project_id: string;
  category_id: string;
  work_date: string;
  start_time: string;
  end_time: string;
  hours_worked: string;
  description: string;
  participants: Participant[];
}) => {
  return apiFetch<TimeEntry>("/api/time-entries/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const uploadFileAttachment = async (timeEntryId: string, file: File) => {
  const formData = new FormData();
  formData.append("time_entry", timeEntryId);
  formData.append("file", file);

  return apiFetch<Attachment>("/api/file-attachments/", {
    method: "POST",
    body: formData,
  });
};

export const fetchApprovals = async () => {
  return unwrapResults(await apiFetch<PaginatedResponse<Approval> | Approval[]>("/api/approvals/"));
};

export const fetchCalendarEvents = async () => {
  return unwrapResults(await apiFetch<PaginatedResponse<CalendarEvent> | CalendarEvent[]>("/api/calendar-events/"));
};

export const createCalendarEvent = async (payload: {
  project_id: string;
  title: string;
  event_date: string;
  event_time: string;
  description?: string;
}) => {
  return apiFetch<CalendarEvent>("/api/calendar-events/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
