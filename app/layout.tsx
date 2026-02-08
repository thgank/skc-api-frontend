import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'Демо — Заявки на закупку',
  description: 'Интерактивный фронтенд для SKC Purchase Requisition API',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0 }}>
        <AntdRegistry>
          <ClientLayout>{children}</ClientLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
