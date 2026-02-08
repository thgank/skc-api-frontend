'use client';

import { useState } from 'react';
import { Button, Space, Popconfirm, Tooltip, App } from 'antd';
import {
  SendOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ShoppingCartOutlined, LockOutlined, StopOutlined,
  UndoOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { api, isApiError } from '@/lib/api';
import { STATUS_TRANSITIONS } from '@/lib/constants';
import type { RequisitionStatus } from '@/lib/types';

interface Props {
  requisitionId: number;
  currentStatus: RequisitionStatus;
  onStatusChange: () => void;
  onDeleted: () => void;
}

const TRANSITION_ICONS: Record<RequisitionStatus, React.ReactNode> = {
  DRAFT: <UndoOutlined />,
  SUBMITTED: <SendOutlined />,
  APPROVED: <CheckCircleOutlined />,
  IN_PROCUREMENT: <ShoppingCartOutlined />,
  CLOSED: <LockOutlined />,
  REJECTED: <CloseCircleOutlined />,
  CANCELLED: <StopOutlined />,
};

export default function StatusActions({ requisitionId, currentStatus, onStatusChange, onDeleted }: Props) {
  const { notification } = App.useApp();
  const [loading, setLoading] = useState<string | null>(null);

  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];
  const isDraft = currentStatus === 'DRAFT';

  const handleTransition = async (targetStatus: RequisitionStatus) => {
    setLoading(targetStatus);
    try {
      await api.transitionRequisition(requisitionId, { targetStatus });
      notification.success({ title: `Статус изменён → ${targetStatus}` });
      onStatusChange();
    } catch (err) {
      if (isApiError(err)) {
        notification.error({
          title: `Ошибка: ${err.errorCode}`,
          description: err.message,
          duration: 6,
        });
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    setLoading('DELETE');
    try {
      await api.deleteRequisition(requisitionId);
      notification.success({ title: 'Заявка удалена' });
      onDeleted();
    } catch (err) {
      if (isApiError(err)) {
        notification.error({
          title: `Ошибка: ${err.errorCode}`,
          description: err.message,
          duration: 6,
        });
      }
    } finally {
      setLoading(null);
    }
  };

  if (transitions.length === 0 && !isDraft) return null;

  return (
    <Space size="small" wrap>
      {transitions.map((t) => (
        <Popconfirm
          key={t.target}
          title={`Сменить статус → ${t.target}?`}
          description={t.danger ? 'Это действие может быть необратимым.' : undefined}
          onConfirm={() => handleTransition(t.target)}
          okButtonProps={{ danger: t.danger }}
        >
          <Button
            type={t.danger ? 'default' : 'primary'}
            danger={t.danger}
            icon={TRANSITION_ICONS[t.target]}
            loading={loading === t.target}
          >
            {t.label}
          </Button>
        </Popconfirm>
      ))}

      {isDraft && (
        <Tooltip title="Удалить заявку и все позиции (только DRAFT)">
          <Popconfirm
            title="Удалить заявку?"
            description="Все позиции будут удалены. Это действие нельзя отменить."
            onConfirm={handleDelete}
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} loading={loading === 'DELETE'}>
              Удалить
            </Button>
          </Popconfirm>
        </Tooltip>
      )}
    </Space>
  );
}
