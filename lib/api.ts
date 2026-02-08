import type {
  ApiError,
  CreateItemPayload,
  CreateRequisitionPayload,
  Nomenclature,
  PatchItemPayload,
  PatchRequisitionPayload,
  Requisition,
  RequisitionDetail,
  RequisitionItem,
  RequisitionSummary,
  TransitionPayload,
  UnitOfMeasure,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://skc-api-production.up.railway.app/api/v1';

function getAuthHeader(): string {
  if (typeof window === 'undefined') return '';
  return 'Basic ' + btoa('admin:admin');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      error = {
        errorCode: 'UNKNOWN_ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`,
        field: null,
        rejectedValue: null,
      };
    }
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

/* ── Public API ── */

export const api = {
  // Requisitions
  getRequisitions: () => request<Requisition[]>('/requisitions'),

  getRequisition: (id: number) => request<RequisitionDetail>(`/requisitions/${id}`),

  getSummary: (id: number) => request<RequisitionSummary>(`/requisitions/${id}/summary`),

  reactivate: (id: number) => request<void>(`/requisitions/${id}/reactivate`, { method: 'POST' }),

  createRequisition: (payload: CreateRequisitionPayload) =>
    request<Requisition>('/requisitions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateRequisition: (id: number, payload: PatchRequisitionPayload) =>
    request<Requisition>(`/requisitions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteRequisition: (id: number) =>
    request<void>(`/requisitions/${id}`, { method: 'DELETE' }),

  transitionRequisition: (id: number, payload: TransitionPayload) =>
    request<Requisition>(`/requisitions/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Items
  createItem: (reqId: number, payload: CreateItemPayload) =>
    request<RequisitionItem>(`/requisitions/${reqId}/items`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  patchItem: (reqId: number, itemId: number, payload: PatchItemPayload) =>
    request<RequisitionItem>(`/requisitions/${reqId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteItem: (reqId: number, itemId: number) =>
    request<void>(`/requisitions/${reqId}/items/${itemId}`, { method: 'DELETE' }),

  // Reference
  getNomenclatures: () => request<Nomenclature[]>('/reference/nomenclatures'),

  getUnits: () => request<UnitOfMeasure[]>('/reference/units'),
};

/* ── Helpers ── */

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'errorCode' in err &&
    'message' in err
  );
}
