import type { RequisitionStatus } from './types';

export const STATUS_CONFIG: Record<RequisitionStatus, { color: string; text: string }> = {
  DRAFT: { color: 'blue', text: 'Черновик' },
  SUBMITTED: { color: 'orange', text: 'Подана' },
  APPROVED: { color: 'green', text: 'Утверждена' },
  IN_PROCUREMENT: { color: 'purple', text: 'В закупке' },
  CLOSED: { color: 'default', text: 'Закрыта' },
  REJECTED: { color: 'red', text: 'Отклонена' },
  CANCELLED: { color: 'default', text: 'Отменена' },
};

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return '—';
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const TRANSITION_LABELS: Record<RequisitionStatus, string> = {
  DRAFT: 'Вернуть в черновик',
  SUBMITTED: 'Подать на рассмотрение',
  APPROVED: 'Утвердить',
  IN_PROCUREMENT: 'Начать закупку',
  CLOSED: 'Закрыть',
  REJECTED: 'Отклонить',
  CANCELLED: 'Отменить',
};

export const STATUS_TRANSITIONS: Record<RequisitionStatus, { target: RequisitionStatus; label: string; danger?: boolean }[]> = {
  DRAFT: [
    { target: 'SUBMITTED', label: 'Подать на рассмотрение' },
    { target: 'CANCELLED', label: 'Отменить', danger: true },
  ],
  SUBMITTED: [
    { target: 'APPROVED', label: 'Утвердить' },
    { target: 'REJECTED', label: 'Отклонить', danger: true },
    { target: 'CANCELLED', label: 'Отменить', danger: true },
  ],
  APPROVED: [
    { target: 'IN_PROCUREMENT', label: 'Начать закупку' },
    { target: 'CANCELLED', label: 'Отменить', danger: true },
  ],
  IN_PROCUREMENT: [
    { target: 'CLOSED', label: 'Закрыть' },
    { target: 'CANCELLED', label: 'Отменить', danger: true },
  ],
  CLOSED: [],
  REJECTED: [
    { target: 'DRAFT', label: 'Вернуть в черновик' },
  ],
  CANCELLED: [
    { target: 'DRAFT', label: 'Реактивировать' },
  ],
};
