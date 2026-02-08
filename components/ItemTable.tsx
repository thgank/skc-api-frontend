'use client';

import { Table, Button, Space, Popconfirm, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RequisitionItem, UnitOfMeasure } from '@/lib/types';
import { formatMoney } from '@/lib/constants';

interface Props {
  items: RequisitionItem[];
  isDraft: boolean;
  units: UnitOfMeasure[];
  onEdit: (item: RequisitionItem) => void;
  onDelete: (itemId: number) => void;
}

export default function ItemTable({ items, isDraft, units, onEdit, onDelete }: Props) {
  const canDelete = items.length > 1;
  const unitName = (code: string) => units.find((u) => u.code === code)?.name ?? code;

  const columns: ColumnsType<RequisitionItem> = [
    { title: '#', dataIndex: 'rowNumber', width: 50, align: 'center' as const },
    { title: 'Код', dataIndex: 'nomenclatureCode', width: 100 },
    { title: 'Наименование', dataIndex: 'nomenclatureName', ellipsis: true },
    {
      title: 'Кол-во',
      dataIndex: 'quantity',
      width: 80,
      align: 'right' as const,
      render: (v: number) => v?.toLocaleString('ru-RU'),
    },
    { title: 'ЕИ', dataIndex: 'unitCode', width: 100, render: (v: string) => unitName(v) },
    {
      title: 'Цена',
      dataIndex: 'priceWithoutVat',
      width: 110,
      align: 'right' as const,
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Сумма',
      key: 'amount',
      width: 130,
      align: 'right' as const,
      render: (_: unknown, r: RequisitionItem) => formatMoney(r.quantity * r.priceWithoutVat),
    },
    {
      title: 'Дата поставки',
      dataIndex: 'desiredDeliveryDate',
      width: 120,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Вер.',
      dataIndex: 'version',
      width: 55,
      align: 'center' as const,
      render: (v: number) => <Tag>{v}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: RequisitionItem) => (
        <Space size={0}>
          <Tooltip title={isDraft ? 'Редактировать' : 'Редактирование доступно только для DRAFT'}>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              disabled={!isDraft}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip
            title={
              !isDraft
                ? 'Редактирование доступно только для DRAFT'
                : !canDelete
                  ? 'Нельзя удалить последнюю позицию в заявке'
                  : 'Удалить позицию'
            }
          >
            <Popconfirm
              title="Удалить эту позицию?"
              description="Это действие нельзя отменить."
              onConfirm={() => onDelete(record.id)}
              disabled={!isDraft || !canDelete}
              okButtonProps={{ danger: true }}
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={!isDraft || !canDelete}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={items}
      rowKey="id"
      pagination={false}
      size="middle"
      bordered
    />
  );
}
