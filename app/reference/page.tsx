'use client';

import { useEffect, useState } from 'react';
import {
  Typography, Card, Table, Tag, Space, Spin, Row, Col, Statistic, App,
} from 'antd';
import {
  DatabaseOutlined, AppstoreOutlined, TagsOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api, isApiError } from '@/lib/api';
import type { Nomenclature, UnitOfMeasure } from '@/lib/types';

const { Title, Paragraph } = Typography;

export default function ReferencePage() {
  const { notification } = App.useApp();
  const [nomenclatures, setNomenclatures] = useState<Nomenclature[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getNomenclatures(), api.getUnits()])
      .then(([noms, uts]) => {
        setNomenclatures(noms);
        setUnits(uts);
      })
      .catch((err) => {
        if (isApiError(err)) {
          notification.error({ title: err.errorCode, description: err.message });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const unitName = (code: string) => units.find((u) => u.code === code)?.name ?? code;

  const nomColumns: ColumnsType<Nomenclature> = [
    {
      title: 'Код',
      dataIndex: 'code',
      width: 120,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Наименование',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: 'Допустимые единицы измерения',
      dataIndex: 'allowedUnits',
      render: (codes: string[]) => (
        <Space size={4} wrap>
          {codes.map((code) => (
            <Tag key={code}>{unitName(code)}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  const unitColumns: ColumnsType<UnitOfMeasure> = [
    {
      title: 'Код',
      dataIndex: 'code',
      width: 120,
      render: (v: string) => <Tag color="green">{v}</Tag>,
    },
    {
      title: 'Наименование',
      dataIndex: 'name',
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ maxWidth: 1100 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Справочные данные
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 24 }}>
          Каталоги номенклатуры и единиц измерения, загруженные из{' '}
          <code>GET /reference/nomenclatures</code> и <code>GET /reference/units</code>
        </Paragraph>

        {/* ── Сводка ── */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={8}>
            <Card>
              <Statistic
                title="Номенклатура (ТРУ)"
                value={nomenclatures.length}
                prefix={<AppstoreOutlined />}
                styles={{ content: { color: '#1677ff' } }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8}>
            <Card>
              <Statistic
                title="Единицы измерения"
                value={units.length}
                prefix={<TagsOutlined />}
                styles={{ content: { color: '#52c41a' } }}
              />
            </Card>
          </Col>
        </Row>

        {/* ── Номенклатура ── */}
        <Card
          title={<><AppstoreOutlined style={{ marginRight: 8 }} />Номенклатура (ТРУ)</>}
          style={{ marginBottom: 24 }}
        >
          <Table
            columns={nomColumns}
            dataSource={nomenclatures}
            rowKey="code"
            pagination={false}
            size="middle"
            bordered
          />
        </Card>

        {/* ── Единицы измерения ── */}
        <Card
          title={<><TagsOutlined style={{ marginRight: 8 }} />Единицы измерения</>}
        >
          <Table
            columns={unitColumns}
            dataSource={units}
            rowKey="code"
            pagination={false}
            size="middle"
            bordered
          />
        </Card>
      </div>
    </Spin>
  );
}
