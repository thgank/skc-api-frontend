/* ── Requisition ── */

export type RequisitionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'IN_PROCUREMENT'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Requisition {
  id: number;
  number: string;
  status: RequisitionStatus;
  organizerId: string;
  totalLotSumNoNds: number;
  createdFrom: string;
  updatedFrom: string;
}

export interface RequisitionDetail extends Requisition {
  items: RequisitionItem[];
}

/* ── Item ── */

export interface RequisitionItem {
  id: number;
  rowNumber: number;
  nomenclatureCode: string;
  nomenclatureName: string;
  quantity: number;
  unitCode: string;
  priceWithoutVat: number;
  desiredDeliveryDate: string | null;
  comment: string | null;
  version: number;
}

/* ── Summary ── */

export interface RequisitionSummary {
  totalAmountWithoutVat: number;
  totalQuantity: number;
  minDesiredDeliveryDate: string | null;
  maxDesiredDeliveryDate: string | null;
  itemCount: number;
  currency: string;
}

/* ── Reference data ── */

export interface Nomenclature {
  code: string;
  name: string;
  allowedUnits: string[];
}

export interface UnitOfMeasure {
  code: string;
  name: string;
}

/* ── API error ── */

export interface ApiError {
  errorCode: string;
  message: string;
  field: string | null;
  rejectedValue: unknown;
}

/* ── Payloads ── */

export interface CreateItemPayload {
  nomenclatureCode: string;
  nomenclatureName: string;
  quantity: number;
  unitCode: string;
  priceWithoutVat: number;
  desiredDeliveryDate: string;
  comment?: string;
}

export interface PatchItemPayload {
  quantity?: number;
  desiredDeliveryDate?: string;
  comment?: string;
  version: number;
}

/* ── Requisition payloads ── */

export interface CreateRequisitionPayload {
  organizerId: string;
}

export interface PatchRequisitionPayload {
  organizerId?: string;
}

export interface TransitionPayload {
  targetStatus: RequisitionStatus;
}
