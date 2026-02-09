'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, ConfigProvider, App, Button, Space, Spin } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { HomeOutlined, FileTextOutlined, BankOutlined, DatabaseOutlined, LogoutOutlined } from '@ant-design/icons';
import { api, clearStoredAuthToken, getStoredAuthToken } from '@/lib/api';

const { Header, Content, Footer } = Layout;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (pathname === '/login') {
      setAuthChecked(true);
      return;
    }

    const token = getStoredAuthToken();
    if (!token) {
      router.replace('/login');
      setAuthChecked(true);
      return;
    }

    api.getCurrentUser()
      .catch(() => {
        clearStoredAuthToken();
        router.replace('/login');
      })
      .finally(() => setAuthChecked(true));
  }, [pathname, router]);

  const handleLogout = () => {
    clearStoredAuthToken();
    router.replace('/login');
  };

  if (!authChecked) {
    return (
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 6,
            colorPrimary: '#1677ff',
          },
        }}
      >
        <App>
          <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
            <Spin size="large" />
          </div>
        </App>
      </ConfigProvider>
    );
  }

  if (pathname === '/login') {
    return (
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 6,
            colorPrimary: '#1677ff',
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    );
  }

  const selectedKey = pathname === '/'
    ? 'home'
    : pathname.startsWith('/requisitions')
      ? 'requisitions'
      : pathname.startsWith('/reference')
        ? 'reference'
        : 'home';

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 6,
          colorPrimary: '#1677ff',
        },
      }}
    >
      <App>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
            <div
            style={{
              color: '#fff',
              fontSize: 18,
                fontWeight: 600,
                marginRight: 32,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
              onClick={() => router.push('/')}
            >
              <BankOutlined style={{ marginRight: 8 }} />
              SKC Закупки
            </div>
              <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[selectedKey]}
              items={[
                {
                  key: 'home',
                  icon: <HomeOutlined />,
                  label: 'Главная',
                  onClick: () => router.push('/'),
                },
                {
                  key: 'requisitions',
                  icon: <FileTextOutlined />,
                  label: 'Заявки',
                  onClick: () => router.push('/requisitions'),
                },
                {
                  key: 'reference',
                  icon: <DatabaseOutlined />,
                  label: 'Справочники',
                  onClick: () => router.push('/reference'),
                },
                ]}
                style={{ flex: 1 }}
              />
              <Space>
                <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                  Выйти
                </Button>
              </Space>
            </Header>

          <Content style={{ padding: '24px 48px', background: '#f5f5f5' }}>
            {children}
          </Content>

          <Footer style={{ textAlign: 'center', color: '#999', background: '#f5f5f5' }}>
            SKC Заявки на закупку · Сериков Нурсултан © 2025
          </Footer>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
