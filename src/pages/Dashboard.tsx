import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Spin, message, Empty } from 'antd';
import {
  DollarOutlined, CheckCircleOutlined, CloseCircleOutlined,
  TeamOutlined, RiseOutlined, CalendarOutlined, StopOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { salesService } from '../services/api';
import type { CommercialAction } from '../types';


const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [data, setData] = useState<CommercialAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await salesService.getAll();
        setData(result);
      } catch {
        message.error('Erro ao carregar dados comerciais');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const norm = (v: string | undefined | null) => (v || '').toString().trim().toUpperCase();

  // Estatísticas
  const totalAcoes = data.length;
  const fechamentos = data.filter(i => norm(i.fechamento).includes('FECHOU') || norm(i.fechamento).includes('COMPARECEU PARA')).length;
  const declinou = data.filter(i => norm(i.fechamento).includes('DECLINOU') || norm(i.fechamento).includes('FALTOU')).length;
  const agendados = data.filter(i => norm(i.statusAtendimento).startsWith('AGENDADO')).length;
  const semRetorno = data.filter(i => norm(i.statusAtendimento).includes('SEM RETORNO')).length;
  const taxaConversao = totalAcoes > 0 ? ((fechamentos / totalAcoes) * 100) : 0;
  const valorTotal = data.reduce((sum, i) => sum + (typeof i.valor === 'number' ? i.valor : 0), 0);

  // Gráfico: ações por mês
  const monthMap: Record<string, number> = {};
  data.forEach(item => {
    if (!item.data) return;
    const parts = item.data.toString().split('/');
    if (parts.length >= 2) {
      const monthKey = parts[1];
      const monthNames: Record<string, string> = {
        '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
        '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
        '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
      };
      const name = monthNames[monthKey] || monthKey;
      monthMap[name] = (monthMap[name] || 0) + 1;
    }
  });
  const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthData = monthOrder
    .filter(m => monthMap[m])
    .map(m => ({ type: m, value: monthMap[m] }));

  // Gráfico: resultados
  const funnelData = [
    { type: 'Total Ações', value: totalAcoes },
    { type: 'Agendados', value: agendados },
    { type: 'Fechamentos', value: fechamentos },
    { type: 'Declinou', value: declinou },
  ].filter(i => i.value > 0);

  const monthConfig = {
    data: monthData,
    xField: 'type',
    yField: 'value',
    label: { text: (d: any) => d.value, style: { fill: '#fff' } },
    color: '#08979c',
    columnStyle: { radius: [4, 4, 0, 0] },
    height: 300,
  };

  const funnelConfig = {
    data: funnelData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.55,
    label: false,
    legend: { position: 'bottom' as const },
    height: 300,
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#888' }}>Carregando dados comerciais...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1680, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 20 }}>Dashboard Comercial</Title>

      {/* Cards Principais - linha única */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center', borderLeft: '3px solid #08979c' }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 12 }}>TOTAL AÇÕES</Text>}
              value={totalAcoes}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center', borderLeft: '3px solid #1890ff' }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 12 }}>AGENDADOS</Text>}
              value={agendados}
              prefix={<CalendarOutlined />}
              valueStyle={{ fontSize: 28, color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center', borderLeft: '3px solid #3f8600' }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 12 }}>FECHAMENTOS</Text>}
              value={fechamentos}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ fontSize: 28, color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center', borderLeft: '3px solid #cf1322' }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 12 }}>DECLINARAM</Text>}
              value={declinou}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ fontSize: 28, color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center', borderLeft: '3px solid #faad14' }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 12 }}>CONVERSÃO</Text>}
              value={taxaConversao}
              suffix="%"
              precision={1}
              prefix={<RiseOutlined />}
              valueStyle={{ fontSize: 28, color: taxaConversao >= 10 ? '#3f8600' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center', borderLeft: '3px solid #999' }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 12 }}>SEM RETORNO</Text>}
              value={semRetorno}
              prefix={<StopOutlined />}
              valueStyle={{ fontSize: 28, color: '#999' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Card de Valor Total destacado */}
      {valorTotal > 0 && (
        <Card
          size="small"
          style={{
            marginBottom: 20,
            background: 'linear-gradient(135deg, #08979c 0%, #006d75 100%)',
            border: 'none',
          }}
        >
          <Row align="middle" justify="center">
            <Col>
              <Statistic
                title={<Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>VALOR TOTAL FATURADO</Text>}
                value={valorTotal}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ fontSize: 36, color: '#fff', fontWeight: 700 }}
                formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Gráficos */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Ações por Mês" size="small">
            {monthData.length > 0 ? (
              <Column {...monthConfig} />
            ) : (
              <Empty description="Sem dados de datas para exibir" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Visão Geral de Resultados" size="small">
            {funnelData.length > 0 ? (
              <Pie {...funnelConfig} />
            ) : (
              <Empty description="Sem dados para exibir" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Dashboard;
