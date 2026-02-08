'use client';

import { useEffect, useState } from 'react';
import {
  Modal, Form, Input, InputNumber, Select, DatePicker,
  Alert, Typography, Space,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { RequisitionItem, Nomenclature, UnitOfMeasure, ApiError } from '@/lib/types';
import { isApiError } from '@/lib/api';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  open: boolean;
  editingItem: RequisitionItem | null;
  nomenclatures: Nomenclature[];
  units: UnitOfMeasure[];
  existingCodes: string[];
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export default function ItemFormModal({
  open, editingItem, nomenclatures, units, existingCodes, onSubmit, onCancel,
}: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const isEdit = !!editingItem;
  const minDate = dayjs().add(3, 'day');

  const selectedNom = nomenclatures.find((n) => n.code === selectedCode) ?? null;
  const allowedUnits = selectedNom?.allowedUnits ?? [];

  const unitName = (code: string) => units.find((u) => u.code === code)?.name ?? code;

  /* Reset form when modal opens */
  useEffect(() => {
    if (!open) return;
    setApiError(null);

    if (editingItem) {
      setSelectedCode(editingItem.nomenclatureCode);
      form.setFieldsValue({
        quantity: editingItem.quantity,
        desiredDeliveryDate: editingItem.desiredDeliveryDate
          ? dayjs(editingItem.desiredDeliveryDate)
          : null,
        comment: editingItem.comment ?? '',
      });
    } else {
      form.resetFields();
      setSelectedCode(null);
    }
  }, [open, editingItem, form]);

  const handleNomenclatureChange = (code: string) => {
    setSelectedCode(code);
    const nom = nomenclatures.find((n) => n.code === code);
    form.setFieldsValue({
      nomenclatureName: nom?.name ?? '',
      unitCode: undefined,
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setApiError(null);

      const payload = isEdit
        ? {
            quantity: values.quantity,
            desiredDeliveryDate: values.desiredDeliveryDate?.format('YYYY-MM-DD'),
            comment: values.comment || undefined,
            version: editingItem!.version,
          }
        : {
            nomenclatureCode: values.nomenclatureCode,
            nomenclatureName: values.nomenclatureName,
            quantity: values.quantity,
            unitCode: values.unitCode,
            priceWithoutVat: values.priceWithoutVat,
            desiredDeliveryDate: values.desiredDeliveryDate?.format('YYYY-MM-DD'),
            comment: values.comment || undefined,
          };

      await onSubmit(payload);
    } catch (err: unknown) {
      if (isApiError(err)) {
        setApiError(err);
        if (err.field) {
          form.setFields([{ name: err.field, errors: [err.message] }]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /* Nomenclatures available for selection (exclude already used, except current) */
  const availableNoms = nomenclatures.filter(
    (n) => !existingCodes.includes(n.code) || (isEdit && n.code === editingItem?.nomenclatureCode),
  );

  return (
    <Modal
      title={isEdit ? `Редактирование позиции #${editingItem?.rowNumber}` : 'Добавить позицию'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
      destroyOnHidden
      okText={isEdit ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
    >
      {apiError && (
        <Alert
          type="error"
          showIcon
          closable
          onClose={() => setApiError(null)}
          style={{ marginBottom: 16 }}
          title={<Text strong>{apiError.errorCode}</Text>}
          description={
            <Space orientation="vertical" size={0}>
              <Text>{apiError.message}</Text>
              {apiError.field && <Text type="secondary">Поле: {apiError.field}</Text>}
              {apiError.rejectedValue != null && (
                <Text type="secondary">Отклонённое значение: {String(apiError.rejectedValue)}</Text>
              )}
            </Space>
          }
        />
      )}

      <Form form={form} layout="vertical" requiredMark="optional">
        {/* ── Create-only fields ── */}
        {!isEdit && (
          <>
            <Form.Item
              name="nomenclatureCode"
              label="Номенклатура"
              rules={[{ required: true, message: 'Выберите номенклатуру' }]}
              tooltip={{
                title: 'Каждый код номенклатуры может встречаться в заявке только один раз',
                icon: <InfoCircleOutlined />,
              }}
            >
              <Select
                showSearch
                placeholder="Выберите номенклатуру…"
                onChange={handleNomenclatureChange}
                options={availableNoms.map((n) => ({
                  value: n.code,
                  label: `${n.code} — ${n.name}`,
                }))}
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              name="nomenclatureName"
              label="Наименование"
              rules={[{ required: true }]}
            >
              <Input disabled placeholder="Заполняется автоматически из справочника" />
            </Form.Item>

            <Form.Item
              name="unitCode"
              label="Единица измерения"
              rules={[{ required: true, message: 'Выберите единицу измерения' }]}
              tooltip={{
                title: 'Доступны только единицы, разрешённые для выбранной номенклатуры',
                icon: <InfoCircleOutlined />,
              }}
            >
              <Select
                placeholder={selectedNom ? 'Выберите единицу' : 'Сначала выберите номенклатуру'}
                disabled={!selectedNom}
                options={allowedUnits.map((u) => ({ value: u, label: `${u} — ${unitName(u)}` }))}
              />
            </Form.Item>

            <Form.Item
              name="priceWithoutVat"
              label="Цена (без НДС)"
              rules={[
                { required: true, message: 'Укажите цену' },
                { type: 'number', min: 0, message: 'Цена должна быть ≥ 0' },
              ]}
              tooltip={{
                title: 'Цена за единицу без НДС. Должна быть ≥ 0.',
                icon: <InfoCircleOutlined />,
              }}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
              />
            </Form.Item>
          </>
        )}

        {/* ── Edit read-only header ── */}
        {isEdit && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: '#fafafa',
              borderRadius: 6,
              border: '1px solid #f0f0f0',
            }}
          >
            <Text strong>
              {editingItem?.nomenclatureCode} — {editingItem?.nomenclatureName}
            </Text>
            <br />
            <Text type="secondary">
              ЕИ: {editingItem?.unitCode} ({unitName(editingItem?.unitCode ?? '')}) · Цена: {editingItem?.priceWithoutVat}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Версия: {editingItem?.version} (для оптимистичной блокировки)
            </Text>
          </div>
        )}

        {/* ── Shared fields ── */}
        <Form.Item
          name="quantity"
          label="Количество"
          rules={[
            { required: true, message: 'Укажите количество' },
            { type: 'number', min: 1, message: 'Количество должно быть ≥ 1' },
          ]}
          tooltip={{
            title: 'Целое число ≥ 1',
            icon: <InfoCircleOutlined />,
          }}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            precision={0}
            placeholder="Введите количество"
          />
        </Form.Item>

        <Form.Item
          name="desiredDeliveryDate"
          label="Желаемая дата поставки"
          rules={[{ required: true, message: 'Выберите дату поставки' }]}
          tooltip={{
            title: 'Не ранее текущей даты + 3 дня',
            icon: <InfoCircleOutlined />,
          }}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < minDate.startOf('day')}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="comment"
          label="Комментарий"
          tooltip={{ title: 'Необязательный комментарий', icon: <InfoCircleOutlined /> }}
        >
          <TextArea rows={2} placeholder="Необязательный комментарий" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
