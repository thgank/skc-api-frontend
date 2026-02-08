'use client';

import { useEffect, useState } from 'react';
import { Typography, Select, Space, Button, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import RequisitionTable from '@/components/RequisitionTable';
import CreateRequisitionModal from '@/components/CreateRequisitionModal';
import { api, isApiError } from '@/lib/api';
import type { Requisition } from '@/lib/types';

const { Title } = Typography;

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'DRAFT', label: 'Черновик' },
  { value: 'SUBMITTED', label: 'Подана' },
  { value: 'APPROVED', label: 'Утверждена' },
  { value: 'IN_PROCUREMENT', label: 'В закупке' },
  { value: 'CLOSED', label: 'Закрыта' },
  { value: 'REJECTED', label: 'Отклонена' },
  { value: 'CANCELLED', label: 'Отменена' },
];

export default function RequisitionsPage() {
  const { notification } = App.useApp();
  const router = useRouter();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    api.getRequisitions()
      .then(setRequisitions)
      .catch((err) => {
        if (isApiError(err)) {
          notification.error({ title: err.errorCode, description: err.message });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = statusFilter
    ? requisitions.filter((r) => r.status === statusFilter)
    : requisitions;

  return (
    <div>
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Заявки на закупку
        </Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            style={{ width: 200 }}
            placeholder="Фильтр по статусу"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Создать заявку
          </Button>
        </Space>
      </Space>

      <RequisitionTable
        data={filtered}
        loading={loading}
        onOpen={(id) => router.push(`/requisitions/${id}`)}
      />

      <CreateRequisitionModal
        open={createOpen}
        onSuccess={(id) => {
          setCreateOpen(false);
          router.push(`/requisitions/${id}`);
        }}
        onCancel={() => setCreateOpen(false)}
      />
    </div>
  );
}
