'use client';

import { useState } from 'react';
import { Modal, Form, Input, Alert, Typography, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { ApiError } from '@/lib/types';
import { api, isApiError } from '@/lib/api';

const { Text } = Typography;

interface Props {
  open: boolean;
  onSuccess: (id: number) => void;
  onCancel: () => void;
}

export default function CreateRequisitionModal({ open, onSuccess, onCancel }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setApiError(null);

      const result = await api.createRequisition({
        organizerId: values.organizerId,
      });

      onSuccess(result.id);
    } catch (err: unknown) {
      if (isApiError(err)) {
        setApiError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Создать заявку на закупку"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={480}
      destroyOnHidden
      okText="Создать"
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
            </Space>
          }
        />
      )}

      <Form form={form} layout="vertical" requiredMark="optional" initialValues={{ organizerId: 'admin' }}>
        <Form.Item
          name="organizerId"
          label="Организатор (ID)"
          rules={[{ required: true, message: 'Укажите ID организатора' }]}
          tooltip={{
            title: 'Идентификатор сотрудника, создающего заявку. Номер заявки генерируется автоматически.',
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input placeholder="например, user-123" />
        </Form.Item>

        <Alert
          type="info"
          showIcon
          title="Заявка будет создана в статусе DRAFT"
          description="После создания вы сможете добавить позиции и подать заявку на рассмотрение."
          style={{ marginTop: 8 }}
        />
      </Form>
    </Modal>
  );
}
