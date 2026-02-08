'use client';

import { Card, Col, Row, Statistic } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import type { RequisitionSummary } from '@/lib/types';

interface Props {
  summary: RequisitionSummary;
}

export default function SummaryPanel({ summary }: Props) {
  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[24, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="Общая сумма"
            value={summary.totalAmountWithoutVat}
            precision={2}
            suffix={summary.currency}
            prefix={<DollarOutlined />}
            styles={{ content: { fontSize: 18 } }}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="Общее кол-во"
            value={summary.totalQuantity}
            precision={0}
            prefix={<ShoppingCartOutlined />}
            styles={{ content: { fontSize: 18 } }}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="Позиции"
            value={summary.itemCount}
            prefix={<NumberOutlined />}
            styles={{ content: { fontSize: 18 } }}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="Мин. дата поставки"
            value={summary.minDesiredDeliveryDate ?? '—'}
            prefix={<CalendarOutlined />}
            styles={{ content: { fontSize: 16 } }}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="Макс. дата поставки"
            value={summary.maxDesiredDeliveryDate ?? '—'}
            prefix={<CalendarOutlined />}
            styles={{ content: { fontSize: 16 } }}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="Валюта"
            value={summary.currency}
            styles={{ content: { fontSize: 18 } }}
          />
        </Col>
      </Row>
    </Card>
  );
}
