import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Typography, Card, Input, Button, message, Select, Row, Col,
  Statistic, Tabs, Modal, Form, InputNumber, Tag, DatePicker,
  Tooltip, Divider, Empty, AutoComplete
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined, PlusOutlined, EditOutlined, DownloadOutlined,
  DollarOutlined, CheckCircleOutlined, WhatsAppOutlined,
  FilterOutlined, ClearOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { salesService } from '../services/api';
import { exportService } from '../services/exportService';
import type { CommercialAction } from '../types';
import {
  ACAO_OPTIONS, ORIGEM_CAMPANHA_OPTIONS, CANAL_VENDA_OPTIONS,
  STATUS_ATENDIMENTO_OPTIONS, FECHAMENTO_OPTIONS,
  TIPO_PROCEDIMENTO_OPTIONS, PROFISSIONAL_OPTIONS
} from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ComercialActions: React.FC = () => {
  const [data, setData] = useState<CommercialAction[]>([]);
  const [filteredData, setFilteredData] = useState<CommercialAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterCanal, setFilterCanal] = useState<string | null>(null);
  const [filterOrigem, setFilterOrigem] = useState<string | null>(null);
  const [filterFechamento, setFilterFechamento] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CommercialAction | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await salesService.getAll();
      const mapped = result.map((item: CommercialAction, index: number) => ({
        ...item,
        key: item.id || index.toString(),
      }));
      setData(mapped);
      setFilteredData(mapped);
    } catch {
      message.error('Erro ao carregar ações comerciais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Lista de clientes únicos para o AutoComplete
  const clientOptions = useMemo(() => {
    const uniqueClients = new Map();
    data.forEach(item => {
      const name = (item.nome || '').trim();
      if (name && !uniqueClients.has(name.toUpperCase())) {
        uniqueClients.set(name.toUpperCase(), { value: name, fone: item.fone });
      }
    });
    return Array.from(uniqueClients.values()).sort((a: any, b: any) => a.value.localeCompare(b.value));
  }, [data]);

  const norm = (v: string | undefined | null) => (v || '').toString().trim().toUpperCase();

  useEffect(() => {
    let result = data;
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(item =>
        item.nome?.toString().toLowerCase().includes(search) ||
        item.fone?.toString().includes(search)
      );
    }
    if (filterStatus) result = result.filter(i => norm(i.statusAtendimento).startsWith(norm(filterStatus)));
    if (filterCanal) result = result.filter(i => norm(i.canalVenda) === norm(filterCanal));
    if (filterOrigem) result = result.filter(i => norm(i.origemCampanha) === norm(filterOrigem));
    if (filterFechamento) result = result.filter(i => norm(i.fechamento) === norm(filterFechamento));
    setFilteredData(result);
  }, [searchText, filterStatus, filterCanal, filterOrigem, filterFechamento, data]);

  const hasFilters = searchText || filterStatus || filterCanal || filterOrigem || filterFechamento;

  const clearFilters = () => {
    setSearchText('');
    setFilterStatus(null);
    setFilterCanal(null);
    setFilterOrigem(null);
    setFilterFechamento(null);
  };

  // Estatísticas
  const totalAcoes = data.length;
  const agendados = data.filter(i => norm(i.statusAtendimento).startsWith('AGENDADO')).length;
  const fechamentos = data.filter(i => norm(i.fechamento).includes('FECHOU') || norm(i.fechamento).includes('COMPARECEU PARA')).length;
  const taxaConversao = totalAcoes > 0 ? ((fechamentos / totalAcoes) * 100).toFixed(1) : '0';
  const valorTotal = data.reduce((sum, i) => sum + (typeof i.valor === 'number' ? i.valor : 0), 0);

  // Dados para gráficos
  const canalData = CANAL_VENDA_OPTIONS.map(canal => ({
    type: canal,
    value: data.filter(i => norm(i.canalVenda) === norm(canal)).length,
  })).filter(i => i.value > 0);

  const origemData = ORIGEM_CAMPANHA_OPTIONS.map(origem => ({
    type: origem.replace('TRÁFEGO ', ''),
    value: data.filter(i => norm(i.origemCampanha) === norm(origem)).length,
  })).filter(i => i.value > 0);

  const statusData = [...STATUS_ATENDIMENTO_OPTIONS, ...FECHAMENTO_OPTIONS].map(status => ({
    type: status,
    value: data.filter(i => norm(i.statusAtendimento) === norm(status) || norm(i.fechamento) === norm(status)).length,
  })).filter(i => i.value > 0);

  // Modal handlers
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: CommercialAction) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      data: record.data ? dayjs(record.data, 'DD/MM/YYYY') : null,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (values: any) => {
    const formattedValues = {
      ...values,
      data: values.data ? values.data.format('DD/MM/YYYY') : '',
      valor: values.valor || null,
      orcamento: values.orcamento || null,
    };

    let recordToSave: CommercialAction;
    if (editingRecord) {
      recordToSave = { ...editingRecord, ...formattedValues };
    } else {
      recordToSave = {
        id: `new-${Date.now()}`,
        ...formattedValues,
        tipoProcedimento: formattedValues.tipoProcedimento || '',
        profissional: formattedValues.profissional || '',
        observacoes: formattedValues.observacoes || '',
      };
    }

    setIsModalOpen(false);
    form.resetFields();

    try {
      await salesService.saveSingle(recordToSave);
      message.success(editingRecord ? 'Ação atualizada com sucesso!' : 'Nova ação adicionada com sucesso!');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao salvar ação:', error);
      const msg = error?.message || 'Erro ao salvar no Supabase.';
      message.error(msg);
    }
  };

  const handleExport = () => {
    const csvData = filteredData.map(item => ({
      Data: item.data,
      Nome: item.nome,
      Telefone: item.fone,
      Acao: item.acao,
      'Origem Campanha': item.origemCampanha,
      'Canal de Venda': item.canalVenda,
      'Status Atendimento': item.statusAtendimento,
      Fechamento: item.fechamento,
      Orcamento: item.orcamento || '',
      Valor: item.valor || '',
      'Tipo Procedimento': item.tipoProcedimento || '',
      Profissional: item.profissional || '',
      Observacoes: item.observacoes || '',
    }));
    exportService.downloadCsv(csvData, 'acoes_comerciais');
  };

  const getStatusColor = (status: string) => {
    const s = norm(status);
    if (s.startsWith('AGENDADO')) return 'blue';
    if (s.includes('REAGEND')) return 'orange';
    if (s.includes('NÃO COMPARECEU') || s.includes('NAO COMPARECEU')) return 'red';
    if (s.includes('NÃO DEMONSTROU')) return 'volcano';
    if (s.includes('SEM RETORNO')) return 'default';
    if (s.includes('AGUARDANDO')) return 'gold';
    if (s.includes('EM CONTATO')) return 'cyan';
    if (s.includes('TRANSFERIDA')) return 'purple';
    return 'default';
  };

  const getFechamentoColor = (fechamento: string) => {
    const f = norm(fechamento);
    if (f.includes('FECHOU') || f.includes('COMPARECEU PARA')) return 'green';
    if (f.includes('FALTOU')) return 'red';
    if (f.includes('DECLINOU') || f.includes('OUTRO LOCAL')) return 'volcano';
    if (f.includes('BRINDE')) return 'cyan';
    return 'default';
  };

  // Colunas principais - sem scroll horizontal
  const columns: ColumnsType<CommercialAction> = [
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      width: 110,
      fixed: 'left',
      sorter: (a, b) => {
        const parseDate = (d: string) => {
          if (!d) return 0;
          const parts = d.split('/');
          if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
          return 0;
        };
        return parseDate(a.data) - parseDate(b.data);
      },
      render: (v: string) => <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{v || '-'}</Text>,
    },
    {
      title: 'Cliente',
      dataIndex: 'nome',
      key: 'nome',
      width: 270,
      fixed: 'left',
      ellipsis: true,
      sorter: (a, b) => (a.nome || '').localeCompare(b.nome || ''),
      render: (nome: string, record: CommercialAction) => (
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <Text strong style={{ fontSize: 13, marginRight: 8 }}>{nome || '-'}</Text>
          {record.fone && (
            <a
              href={`https://wa.me/55${String(record.fone).replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: '#25D366', display: 'inline-flex', alignItems: 'center' }}
            >
              <WhatsAppOutlined style={{ marginRight: 4 }} /> {record.fone}
            </a>
          )}
        </div>
      ),
    },
    {
      title: 'Tipo / Proc.',
      dataIndex: 'acao',
      key: 'acao',
      width: 140,
      align: 'left' as const,
      ellipsis: true,
      render: (v: string, record: CommercialAction) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          {v ? <Tag color={v === 'ATIVA' ? 'cyan' : 'purple'} style={{ fontSize: 11, margin: 0, marginRight: 4 }}>{v}</Tag> : '- '}
          {record.tipoProcedimento && (
            <Text type="secondary" style={{ fontSize: 11 }}>{record.tipoProcedimento}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Origem / Canal',
      key: 'origemCanal',
      width: 190,
      ellipsis: true,
      render: (_: any, record: CommercialAction) => (
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ fontSize: 13 }}>{record.origemCampanha || '-'}</span>
          {record.canalVenda && (
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>/ {record.canalVenda}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statusAtendimento',
      key: 'statusAtendimento',
      width: 150,
      align: 'left' as const,
      render: (v: string) => v ? <Tag color={getStatusColor(v)} style={{ fontSize: 12, margin: 0, whiteSpace: 'nowrap' }}>{v.trim()}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Fechamento / Prof.',
      dataIndex: 'fechamento',
      key: 'fechamento',
      width: 190,
      ellipsis: true,
      align: 'left' as const,
      render: (v: string, record: CommercialAction) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          {v ? <Tag color={getFechamentoColor(v)} style={{ fontSize: 12, margin: 0, marginRight: 4 }}>{v.trim()}</Tag> : <Text type="secondary">- </Text>}
          {record.profissional && (
            <Text type="secondary" style={{ fontSize: 11 }}>/ {record.profissional}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Orçamento',
      dataIndex: 'orcamento',
      key: 'orcamento',
      width: 120,
      align: 'left' as const,
      render: (v: number | null) => v != null
        ? <Text style={{ color: '#faad14', fontSize: 13, whiteSpace: 'nowrap' }}>R$ {v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        : <Text type="secondary">-</Text>,
      sorter: (a, b) => (a.orcamento || 0) - (b.orcamento || 0),
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      width: 120,
      align: 'left' as const,
      render: (v: number | null) => v != null
        ? <Text strong style={{ color: '#08979c', fontSize: 13, whiteSpace: 'nowrap' }}>R$ {v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        : <Text type="secondary">-</Text>,
      sorter: (a, b) => (a.valor || 0) - (b.valor || 0),
    },
    {
      title: '',
      key: 'actions',
      width: 76,
      fixed: 'right',
      render: (_: any, record: CommercialAction) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {record.observacoes && (
            <Tooltip title={record.observacoes} overlayStyle={{ maxWidth: 300 }}>
              <Button type="text" icon={<div style={{ color: '#faad14' }}>📝</div>} size="small" />
            </Tooltip>
          )}
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  const pieConfig = {
    data: canalData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    label: false,
    legend: { position: 'bottom' as const },
    height: 280,
  };

  const origemConfig = {
    data: origemData,
    xField: 'type',
    yField: 'value',
    label: { text: (d: any) => d.value, style: { fill: '#fff' } },
    color: '#08979c',
    columnStyle: { radius: [4, 4, 0, 0] },
    height: 280,
  };

  const statusConfig = {
    data: statusData,
    xField: 'type',
    yField: 'value',
    label: { text: (d: any) => d.value, style: { fill: '#fff' } },
    color: '#faad14',
    columnStyle: { radius: [4, 4, 0, 0] },
    height: 280,
  };

  return (
    <div style={{ width: '100%', padding: '0 24px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, flexWrap: 'wrap', gap: 12
      }}>
        {/* ... (header content remains same) ... */}
        <Title level={3} style={{ margin: 0 }}>Ações Comerciais</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            disabled={filteredData.length === 0}
          >
            Exportar ({filteredData.length})
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Nova Ação
          </Button>
        </div>
      </div>

      {/* ... (stats row remains same) ... */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {/* ... stats content ... */}
        {/* I need to keep the stats row content, I will just replace the container and table part mostly */}
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="Total" value={totalAcoes} valueStyle={{ fontSize: 24 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Agendados"
              value={agendados}
              valueStyle={{ fontSize: 24, color: '#1890ff' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Conversão"
              value={parseFloat(taxaConversao)}
              suffix="%"
              precision={1}
              valueStyle={{ fontSize: 24, color: fechamentos > 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Valor Total"
              value={valorTotal}
              precision={2}
              valueStyle={{ fontSize: 24, color: '#08979c' }}
              prefix={<DollarOutlined />}
              formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="1"
        type="card"
        items={[
          {
            key: '1',
            label: 'Relatório Comercial',
            children: (
              <Card
                size="small"
                style={{ borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
              >
                {/* Barra de Filtros */}
                <div style={{
                  display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap',
                  alignItems: 'center', padding: '12px 0'
                }}>
                  <FilterOutlined style={{ color: '#999', marginRight: 4 }} />
                  <Input
                    placeholder="Buscar cliente..."
                    prefix={<SearchOutlined />}
                    style={{ width: 200 }}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                  />
                  <Select
                    placeholder="Status"
                    style={{ minWidth: 150 }}
                    allowClear
                    value={filterStatus}
                    onChange={val => setFilterStatus(val || null)}
                    options={STATUS_ATENDIMENTO_OPTIONS.map(o => ({ value: o, label: o }))}
                  />
                  <Select
                    placeholder="Canal"
                    style={{ minWidth: 150 }}
                    allowClear
                    value={filterCanal}
                    onChange={val => setFilterCanal(val || null)}
                    options={CANAL_VENDA_OPTIONS.map(o => ({ value: o, label: o }))}
                  />
                  <Select
                    placeholder="Origem"
                    style={{ minWidth: 180 }}
                    allowClear
                    value={filterOrigem}
                    onChange={val => setFilterOrigem(val || null)}
                    options={ORIGEM_CAMPANHA_OPTIONS.map(o => ({ value: o, label: o }))}
                  />
                  <Select
                    placeholder="Fechamento"
                    style={{ minWidth: 170 }}
                    allowClear
                    value={filterFechamento}
                    onChange={val => setFilterFechamento(val || null)}
                    options={FECHAMENTO_OPTIONS.map(o => ({ value: o, label: o }))}
                  />
                  {hasFilters && (
                    <Button icon={<ClearOutlined />} onClick={clearFilters} type="link" danger>
                      Limpar
                    </Button>
                  )}
                </div>

                <Table
                  columns={columns}
                  dataSource={filteredData}
                  loading={loading}
                  pagination={{
                    defaultPageSize: 20,
                    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
                  }}
                  scroll={{ x: 1366 }}
                  size="middle"
                  rowKey="id"
                  locale={{
                    emptyText: <Empty description="Nenhuma ação comercial encontrada" />,
                    triggerAsc: 'Clique para ordenar em ordem crescente',
                    triggerDesc: 'Clique para ordenar em ordem decrescente',
                    cancelSort: 'Clique para cancelar a ordenação'
                  }}
                  rowClassName={(_record, index) => index % 2 === 0 ? '' : 'ant-table-row-striped'}
                />
              </Card>
            ),
          },
          {
            key: '2',
            label: 'Gráficos e Análises',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                  <Card title="Por Canal de Venda" size="small">
                    {canalData.length > 0
                      ? <Pie {...pieConfig} />
                      : <Empty description="Sem dados" />
                    }
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Por Origem de Campanha" size="small">
                    {origemData.length > 0
                      ? <Column {...origemConfig} />
                      : <Empty description="Sem dados" />
                    }
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Por Status / Fechamento" size="small">
                    {statusData.length > 0
                      ? <Column {...statusConfig} />
                      : <Empty description="Sem dados" />
                    }
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />

      {/* Modal Adicionar/Editar */}
      <Modal
        title={editingRecord ? 'Editar Ação Comercial' : 'Nova Ação Comercial'}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Divider style={{ margin: '12px 0 20px' }} />
        <Form form={form} onFinish={handleSave} layout="vertical" size="large">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="data" label="Data" rules={[{ required: true, message: 'Informe a data' }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Selecione" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="nome" label="Nome do Cliente" rules={[{ required: true, message: 'Informe o nome' }]}>
                <AutoComplete
                  options={clientOptions}
                  placeholder="Nome completo (busque ou digite novo)"
                  filterOption={(inputValue, option) =>
                    option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  onSelect={(_value, option) => {
                    if (option.fone) {
                      form.setFieldsValue({ fone: option.fone });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="fone" label="Telefone">
                <Input placeholder="(99) 99999-9999" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="acao" label="Tipo de Ação" rules={[{ required: true }]}>
                <Select placeholder="Selecione" options={ACAO_OPTIONS.map(o => ({ value: o, label: o }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="origemCampanha" label="Origem da Campanha" rules={[{ required: true }]}>
                <Select placeholder="Selecione" options={ORIGEM_CAMPANHA_OPTIONS.map(o => ({ value: o, label: o }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="canalVenda" label="Canal de Venda" rules={[{ required: true }]}>
                <Select placeholder="Selecione" options={CANAL_VENDA_OPTIONS.map(o => ({ value: o, label: o }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item name="statusAtendimento" label="Status">
                <Select allowClear placeholder="Selecione" options={STATUS_ATENDIMENTO_OPTIONS.map(o => ({ value: o, label: o }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="fechamento" label="Fechamento">
                <Select allowClear placeholder="Selecione" options={FECHAMENTO_OPTIONS.map(o => ({ value: o, label: o }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="orcamento" label="Orçamento (R$)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  decimalSeparator=","
                  placeholder="0,00"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="valor" label="Valor Fechado (R$)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  decimalSeparator=","
                  placeholder="0,00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="tipoProcedimento" label="Procedimento">
                <Select allowClear placeholder="Selecione" options={TIPO_PROCEDIMENTO_OPTIONS.map(o => ({ value: o, label: o }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="profissional" label="Profissional">
                <Select allowClear placeholder="Selecione" options={PROFISSIONAL_OPTIONS.map(o => ({ value: o, label: o }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="observacoes" label="Observações">
                <Input.TextArea rows={2} placeholder="Anotações..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px' }} />
          <Button type="primary" htmlType="submit" block size="large" style={{ height: 48 }}>
            {editingRecord ? 'Salvar Alterações' : 'Adicionar Ação'}
          </Button>
        </Form>
      </Modal>
    </div >
  );
};

export default ComercialActions;
