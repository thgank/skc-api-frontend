'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography, Alert, Button, Space, Spin, App,
  Breadcrumb, Card, Tag, Tooltip,
} from 'antd';
import {
  PlusOutlined, ArrowLeftOutlined, ReloadOutlined,
} from '@ant-design/icons';
import SummaryPanel from '@/components/SummaryPanel';
import ItemTable from '@/components/ItemTable';
import ItemFormModal from '@/components/ItemFormModal';
import ConcurrencyDemo from '@/components/ConcurrencyDemo';
import StatusActions from '@/components/StatusActions';
import { api, isApiError } from '@/lib/api';
import { STATUS_CONFIG } from '@/lib/constants';
import type {
  RequisitionDetail, RequisitionSummary, RequisitionItem, Nomenclature, UnitOfMeasure,
} from '@/lib/types';

const { Title, Text } = Typography;

export default function RequisitionDetailPage() {
  const { notification } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const requisitionId = Number(params.id);

  const [requisition, setRequisition] = useState<RequisitionDetail | null>(null);
  const [summary, setSummary] = useState<RequisitionSummary | null>(null);
  const [nomenclatures, setNomenclatures] = useState<Nomenclature[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RequisitionItem | null>(null);

  const isDraft = requisition?.status === 'DRAFT';

  /* ── Data loading ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [req, sum, noms, uts] = await Promise.all([
        api.getRequisition(requisitionId),
        api.getSummary(requisitionId),
        api.getNomenclatures(),
        api.getUnits(),
      ]);
      setRequisition(req);
      setSummary(sum);
      setNomenclatures(noms);
      setUnits(uts);
    } catch (err) {
      if (isApiError(err)) {
        notification.error({ title: err.errorCode, description: err.message });
      }
    } finally {
      setLoading(false);
    }
  }, [requisitionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Item CRUD handlers ── */
  const handleCreateItem = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEditItem = (item: RequisitionItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await api.deleteItem(requisitionId, itemId);
      notification.success({ title: 'Позиция удалена' });
      loadData();
    } catch (err) {
      if (isApiError(err)) {
        notification.error({
          title: `Ошибка: ${err.errorCode}`,
          description: err.message,
          duration: 6,
        });
      }
    }
  };

  const handleModalSubmit = async (values: Record<string, unknown>) => {
    if (editingItem) {
      // PATCH
      await api.patchItem(requisitionId, editingItem.id, {
        quantity: values.quantity as number,
        desiredDeliveryDate: values.desiredDeliveryDate as string,
        comment: (values.comment as string) || undefined,
        version: editingItem.version,
      });
      notification.success({ title: 'Позиция обновлена' });
    } else {
      // POST
      await api.createItem(requisitionId, {
        nomenclatureCode: values.nomenclatureCode as string,
        nomenclatureName: values.nomenclatureName as string,
        quantity: values.quantity as number,
        unitCode: values.unitCode as string,
        priceWithoutVat: values.priceWithoutVat as number,
        desiredDeliveryDate: values.desiredDeliveryDate as string,
        comment: (values.comment as string) || undefined,
      });
      notification.success({ title: 'Позиция добавлена' });
    }
    setModalOpen(false);
    loadData();
  };

  /* ── Render ── */
  if (loading && !requisition) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!requisition) {
    return <Alert type="error" title="Заявка не найдена" showIcon />;
  }

  const statusCfg = STATUS_CONFIG[requisition.status] ?? { color: 'default', text: requisition.status };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* ── Breadcrumbs ── */}
      <Breadcrumb
        items={[
          { title: <a onClick={() => router.push('/')}>Главная</a> },
          { title: <a onClick={() => router.push('/requisitions')}>Заявки</a> },
          { title: requisition.number },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* ── Header ── */}
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }}
      >
        <Space align="center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/requisitions')} />
          <Title level={3} style={{ margin: 0 }}>{requisition.number}</Title>
          <Tag color={statusCfg.color}>{statusCfg.text}</Tag>
          <Text type="secondary">Организатор: {requisition.organizerId}</Text>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
          Обновить
        </Button>
      </Space>

      {/* ── Status Actions ── */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <StatusActions
          requisitionId={requisitionId}
          currentStatus={requisition.status}
          onStatusChange={loadData}
          onDeleted={() => router.push('/requisitions')}
        />
      </Card>

      {/* ── Read-only alert ── */}
      {!isDraft && (
        <Alert
          type="info"
          showIcon
          title="Только для чтения"
          description={`Заявка в статусе ${statusCfg.text}. Редактирование позиций доступно только для DRAFT.`}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* ── Summary ── */}
      {summary && <SummaryPanel summary={summary} />}

      {/* ── Items Table ── */}
      <Card
        title={`Позиции (${requisition.items.length})`}
        style={{ marginTop: 8 }}
        extra={
          isDraft ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateItem}>
              Добавить
            </Button>
          ) : (
            <Tooltip title="Добавление доступно только для DRAFT">
              <Button type="primary" icon={<PlusOutlined />} disabled>
                Добавить
              </Button>
            </Tooltip>
          )
        }
      >
        <ItemTable
          items={requisition.items}
          isDraft={isDraft}
          units={units}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />
      </Card>

      {/* ── Concurrency Demo ── */}
      {isDraft && requisition.items.length > 0 && (
        <ConcurrencyDemo
          requisitionId={requisitionId}
          item={requisition.items[0]}
          onReload={loadData}
        />
      )}

      {/* ── Item Modal ── */}
      <ItemFormModal
        open={modalOpen}
        editingItem={editingItem}
        nomenclatures={nomenclatures}
        units={units}
        existingCodes={requisition.items.map((i) => i.nomenclatureCode)}
        onSubmit={handleModalSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
