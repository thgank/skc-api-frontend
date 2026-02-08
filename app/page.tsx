'use client';

import { useEffect, useState } from 'react';
import {
  Card, Col, Row, Statistic, Typography, Button,
  Space, Spin, Tag, App,
} from 'antd';
import {
  EditOutlined, CheckCircleOutlined, LockOutlined,
  CloseCircleOutlined, StopOutlined, CalendarOutlined,
  SafetyCertificateOutlined, CopyOutlined, ExclamationCircleOutlined,
  FileTextOutlined, ApiOutlined, UnorderedListOutlined,
  RocketOutlined, AuditOutlined, DatabaseOutlined,
  InfoCircleOutlined, CodeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { api, isApiError } from '@/lib/api';
import type { Requisition } from '@/lib/types';

const { Title, Paragraph, Text } = Typography;

export default function DashboardPage() {
  const { notification } = App.useApp();
  const router = useRouter();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRequisitions()
      .then(setRequisitions)
      .catch((err) => {
        if (isApiError(err)) {
          notification.error({ title: err.errorCode, description: err.message });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const countByStatus = (status: string) =>
    requisitions.filter((r) => r.status === status).length;

  const draftReq = requisitions.find((r) => r.status === 'DRAFT');
  const approvedReq = requisitions.find((r) => r.status === 'APPROVED');

  const rules = [
    {
      icon: <EditOutlined style={{ color: '#1677ff' }} />,
      text: 'Редактировать можно только заявки в статусе DRAFT — остальные доступны только для чтения',
    },
    {
      icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
      text: 'Нельзя удалить последнюю позицию в заявке',
    },
    {
      icon: <CalendarOutlined style={{ color: '#fa8c16' }} />,
      text: 'Дата поставки должна быть не ранее текущей даты + 3 дня',
    },
    {
      icon: <CopyOutlined style={{ color: '#722ed1' }} />,
      text: 'Дублирование номенклатуры в одной заявке запрещено',
    },
    {
      icon: <SafetyCertificateOutlined style={{ color: '#52c41a' }} />,
      text: 'Оптимистичная блокировка — параллельные изменения возвращают 409 Conflict',
    },
    {
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      text: 'Все ошибки валидации бэкенда отображаются в UI с кодом, сообщением и полем',
    },
    {
      icon: <FileTextOutlined style={{ color: '#1677ff' }} />,
      text: 'Полный жизненный цикл заявки: DRAFT → SUBMITTED → APPROVED → IN_PROCUREMENT → CLOSED',
    },
    {
      icon: <StopOutlined style={{ color: '#8c8c8c' }} />,
      text: 'Отмена и реактивация: любая заявка → CANCELLED, а CANCELLED/REJECTED → DRAFT',
    },
    {
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      text: 'Нельзя подать заявку без позиций (DRAFT → SUBMITTED требует ≥ 1 позиции)',
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ maxWidth: 1100 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Шоукейс — Управление  позициями в закупочной системе
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 24 }}>
          Frontend-витрина для демонстрации бэкенд-тестового задания (Java / Spring Boot API)
        </Paragraph>

        {/* ── О проекте ── */}
        <Card
          title={<><InfoCircleOutlined style={{ marginRight: 8 }} />О проекте</>}
          style={{ marginBottom: 24 }}
        >
          <Paragraph>
            Приветствую! Данный сайт является небольшой обёрткой к тестовому заданию по управлению позициями в закупочной системе,
            в рамках прохождения собеседования в SKC в роли Java Backend разработчика.
            
            Enjoy :)
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            <Text strong>Стек бэкенда:</Text> Java 21, Spring Boot, JPA / Hibernate, H2 (in-memory),
            Basic Auth, Swagger / OpenAPI.
            <br />
            <Text strong>Стек фронтенда:</Text> Next.js 16, React 19, TypeScript, Ant Design 6.
          </Paragraph>
        </Card>

        {/* ── Карточки статусов ── */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card hoverable onClick={() => router.push('/requisitions')}>
              <Statistic
                title="Черновик"
                value={countByStatus('DRAFT')}
                prefix={<EditOutlined />}
                styles={{ content: { color: '#1677ff' } }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable onClick={() => router.push('/requisitions')}>
              <Statistic
                title="Утверждена"
                value={countByStatus('APPROVED')}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: '#52c41a' } }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable onClick={() => router.push('/requisitions')}>
              <Statistic
                title="Закрыта"
                value={countByStatus('CLOSED')}
                prefix={<LockOutlined />}
                styles={{ content: { color: '#8c8c8c' } }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable onClick={() => router.push('/requisitions')}>
              <Statistic
                title="Отменена"
                value={countByStatus('CANCELLED')}
                prefix={<CloseCircleOutlined />}
                styles={{ content: { color: '#ff4d4f' } }}
              />
            </Card>
          </Col>
        </Row>

        {/* ── Бизнес-правила ── */}
        <Card
          title={<><AuditOutlined style={{ marginRight: 8 }} />Демонстрируемые бизнес-правила</>}
          style={{ marginTop: 24 }}
        >
          <Space orientation="vertical" style={{ width: '100%' }}>
            {rules.map((item, idx) => (
              <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Space>
                  {item.icon}
                  <Text>{item.text}</Text>
                </Space>
              </div>
            ))}
          </Space>
        </Card>

        {/* ── Быстрые действия ── */}
        <Card
          title={<><RocketOutlined style={{ marginRight: 8 }} />Быстрые действия</>}
          style={{ marginTop: 24 }}
        >
          <Space size="middle" wrap>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="large"
              disabled={!draftReq}
              onClick={() => draftReq && router.push(`/requisitions/${draftReq.id}`)}
            >
              Открыть черновик
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              size="large"
              disabled={!approvedReq}
              onClick={() => approvedReq && router.push(`/requisitions/${approvedReq.id}`)}
            >
              Утверждённая (только чтение)
            </Button>
            <Button
              icon={<UnorderedListOutlined />}
              size="large"
              onClick={() => router.push('/requisitions')}
            >
              Все заявки
            </Button>
            <Button
              icon={<ApiOutlined />}
              size="large"
              href="https://skc-api-production.up.railway.app/swagger-ui.html"
              target="_blank"
            >
              Swagger UI
            </Button>
            <Button
              icon={<DatabaseOutlined />}
              size="large"
              onClick={() => router.push('/reference')}
            >
              Справочники
            </Button>
          </Space>
        </Card>
      </div>
    </Spin>
  );
}
