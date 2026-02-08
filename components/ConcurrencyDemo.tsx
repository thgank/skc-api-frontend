'use client';

import { useState } from 'react';
import { Card, Button, Alert, Space, Typography, Tag } from 'antd';
import {
  ThunderboltOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { api, isApiError } from '@/lib/api';
import type { RequisitionItem, ApiError } from '@/lib/types';

const { Text, Paragraph } = Typography;

interface Props {
  requisitionId: number;
  item: RequisitionItem;
  onReload: () => void;
}

interface RequestResult {
  success: boolean;
  label: string;
  message: string;
  error?: ApiError;
}

export default function ConcurrencyDemo({ requisitionId, item, onReload }: Props) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<RequestResult[] | null>(null);

  const simulate = async () => {
    setRunning(true);
    setResults(null);

    const version = item.version;
    const promises = [
      api.patchItem(requisitionId, item.id, { quantity: item.quantity + 1, version }),
      api.patchItem(requisitionId, item.id, { quantity: item.quantity + 2, version }),
    ];

    const settled = await Promise.allSettled(promises);

    const mapped: RequestResult[] = settled.map((r, i) => {
      const label = `Запрос #${i + 1} (кол-во → ${item.quantity + i + 1})`;
      if (r.status === 'fulfilled') {
        return { success: true, label, message: `Успешно — новая версия: ${r.value.version}` };
      }
      const err = r.reason;
      if (isApiError(err)) {
        return { success: false, label, message: 'Ошибка — конфликт версий', error: err };
      }
      return { success: false, label, message: `Ошибка: ${String(err)}` };
    });

    setResults(mapped);
    setRunning(false);
  };

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#faad14' }} />
          Демо: оптимистичная блокировка
        </Space>
      }
      style={{ marginTop: 24 }}
    >
      <Paragraph type="secondary">
        Отправляет <Text strong>два параллельных PATCH-запроса</Text> с{' '}
        <Text strong>одной и той же версией ({item.version})</Text> для позиции{' '}
        <Text code>{item.nomenclatureCode}</Text>. Один успешен, другой получает{' '}
        <Tag color="red">409 Conflict</Tag>.
      </Paragraph>

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          danger
          icon={<ThunderboltOutlined />}
          loading={running}
          onClick={simulate}
        >
          Симулировать параллельное изменение
        </Button>
        {results && (
          <Button icon={<ReloadOutlined />} onClick={onReload}>
            Обновить данные
          </Button>
        )}
      </Space>

      {results && (
        <Space orientation="vertical" style={{ width: '100%' }}>
          {results.map((r, i) => (
            <Alert
              key={i}
              type={r.success ? 'success' : 'error'}
              icon={r.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              showIcon
              title={
                <Text>
                  <Text strong>{r.label}:</Text> {r.message}
                </Text>
              }
              description={
                r.error && (
                  <Space orientation="vertical" size={0} style={{ marginTop: 4 }}>
                    <Text type="secondary">
                      Код: <Text code>{r.error.errorCode}</Text>
                    </Text>
                    <Text type="secondary">{r.error.message}</Text>
                  </Space>
                )
              }
            />
          ))}
        </Space>
      )}
    </Card>
  );
}
