'use client';

import { Table, Badge, Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Requisition, RequisitionStatus } from '@/lib/types';
import { STATUS_CONFIG, formatMoney } from '@/lib/constants';

interface Props {
  data: Requisition[];
  loading?: boolean;
  onOpen: (id: number) => void;
}

export default function RequisitionTable({ data, loading, onOpen }: Props) {
  const columns: ColumnsType<Requisition> = [
    {
      title: 'Номер',
      dataIndex: 'number',
      sorter: (a, b) => a.number.localeCompare(b.number),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status: RequisitionStatus) => {
        const cfg = STATUS_CONFIG[status] ?? { color: 'default', text: status };
        return <Badge color={cfg.color} text={cfg.text} />;
      },
    },
    {
      title: 'Организатор',
      dataIndex: 'organizerId',
    },
    {
      title: 'Сумма (без НДС)',
      dataIndex: 'totalLotSumNoNds',
      render: (v: number) => `${formatMoney(v)} KZT`,
      align: 'right' as const,
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Requisition) => (
        <Tooltip title="Открыть детали заявки">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={(e) => { e.stopPropagation(); onOpen(record.id); }}
          >
            Открыть
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={false}
      onRow={(record) => ({
        onClick: () => onOpen(record.id),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
