'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { api, buildBasicToken, clearStoredAuthToken, getStoredAuthToken, setStoredAuthToken } from '@/lib/api';

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { notification } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) return;
    api.getCurrentUser()
      .then(() => router.replace('/'))
      .catch(() => clearStoredAuthToken());
  }, [router]);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const token = buildBasicToken(values.username.trim(), values.password);
      setStoredAuthToken(token);
      await api.getCurrentUser();
      notification.success({ title: 'Авторизация успешна' });
      router.replace('/');
    } catch {
      clearStoredAuthToken();
      notification.error({
        title: 'Ошибка авторизации',
        description: 'Неверный логин или пароль',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'linear-gradient(160deg, #f0f5ff 0%, #e6f4ff 45%, #f6ffed 100%)',
      }}
    >
      <Card style={{ width: 380, maxWidth: '100%' }}>
        <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>Вход в SKC Закупки</Title>
        <Text type="secondary">Введите учётные данные для доступа к API</Text>
        <Form<LoginFormValues>
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ username: 'admin', password: 'admin' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="username"
            label="Логин"
            rules={[{ required: true, message: 'Введите логин' }]}
          >
            <Input prefix={<UserOutlined />} autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
}
