
import React, { useEffect, useState } from 'react';
import { Table, Typography, Card, Input, Button, message, Select, Space, Row, Col, Statistic, Tabs, List, Tag, Badge, Modal, Form, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, SaveOutlined, DownloadOutlined, WarningOutlined, CheckCircleOutlined, EditOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { birthdayService } from '../services/api';
import { exportService } from '../services/exportService';
import { Column } from '@ant-design/charts';

const { Title } = Typography;

interface BirthdayData {
  key?: string;
  Nome: string;
  DataNascimento: string | number;
  Celular: string | number;
}

const Birthdays: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [data, setData] = useState<BirthdayData[]>([]);
  const [filteredData, setFilteredData] = useState<BirthdayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [period, setPeriod] = useState<'first_half' | 'second_half' | 'all'>('all');
  const [birthdayChartData, setBirthdayChartData] = useState<{ type: string; value: number }[]>([]);

  const [qualityStats, setQualityStats] = useState({
    duplicateNames: [] as BirthdayData[],
    duplicatePhones: [] as BirthdayData[],
    emptyNames: [] as BirthdayData[],
    emptyPhones: [] as BirthdayData[],
    invalidDates: [] as BirthdayData[],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BirthdayData | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: BirthdayData) => {
    setEditingRecord(record);
    // Convert date for form if possible, else leave empty or string
    // Convert date for form if possible, else leave empty or string
    // Logic for date parsing removed as it was unused
    form.setFieldsValue({
      ...record,
      // DataNascimento logic will be handled inside effect or directly here if simple
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleSave = async (values: any) => {
    // 1. Update local state
    // 2. Send entire data to backend
    if (!editingRecord) return;

    const updatedList = data.map(item => {
      if (item.key === editingRecord.key) {
        return { ...item, ...values };
      }
      return item;
    });

    setData(updatedList);
    // Re-apply filters
    // This is skipped for brevity, but ideally we re-run filter logic or just update filteredData too if key matches
    setFilteredData(prev => prev.map(item => item.key === editingRecord.key ? { ...item, ...values } : item));

    setIsModalOpen(false);
    setEditingRecord(null);

    try {
      await birthdayService.save(updatedList);
      message.success('Aniversariante atualizado com sucesso!');
      // Refresh stats? Quality audit might need re-run. 
      // Simple way: re-fetch from backend? 
      // Or re-run local logic. Let's just re-fetch to be safe and get fresh stats.
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erro ao salvar no arquivo Excel.';
      message.error(errorMsg);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await birthdayService.getAll();
      // Add keys for Ant Design Table
      const mappedData = result.map((item: any, index: number) => ({
        ...item,
        key: index.toString(),
      }));
      setData(mappedData);
      setFilteredData(mappedData);

      // Process Chart Data and Quality Audit
      const monthCounts = new Array(12).fill(0);

      const duplicatesNameMap = new Map();
      const duplicatesPhoneMap = new Map();
      const emptyNames: BirthdayData[] = [];
      const emptyPhones: BirthdayData[] = [];
      const invalidDates: BirthdayData[] = [];
      const duplicateNamesList: BirthdayData[] = [];
      const duplicatePhonesList: BirthdayData[] = [];

      mappedData.forEach((item: BirthdayData) => {
        // Date Check
        let date: Date;
        if (typeof item.DataNascimento === 'number') {
          date = new Date(Math.round((item.DataNascimento - 25569) * 86400 * 1000));
        } else {
          date = new Date(item.DataNascimento);
        }

        if (!isNaN(date.getTime())) {
          monthCounts[date.getMonth()]++;
        } else {
          invalidDates.push(item);
        }

        // Empty Checks
        if (!item.Nome || item.Nome.toString().trim() === '') emptyNames.push(item);
        if (!item.Celular || item.Celular.toString().trim() === '') emptyPhones.push(item);

        // Duplicates Checks
        const nameKey = item.Nome ? item.Nome.toString().toLowerCase().trim() : '';
        if (nameKey) {
          if (duplicatesNameMap.has(nameKey)) {
            duplicatesNameMap.set(nameKey, duplicatesNameMap.get(nameKey) + 1);
            duplicateNamesList.push(item);
          } else {
            duplicatesNameMap.set(nameKey, 1);
          }
        }

        const phoneKey = item.Celular ? item.Celular.toString().replace(/\D/g, '') : '';
        if (phoneKey) {
          if (duplicatesPhoneMap.has(phoneKey)) {
            duplicatesPhoneMap.set(phoneKey, duplicatesPhoneMap.get(phoneKey) + 1);
            duplicatePhonesList.push(item);
          } else {
            duplicatesPhoneMap.set(phoneKey, 1);
          }
        }
      });

      setQualityStats({
        duplicateNames: duplicateNamesList,
        duplicatePhones: duplicatePhonesList,
        emptyNames,
        emptyPhones,
        invalidDates
      });

      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      setBirthdayChartData(monthNames.map((name, index) => ({ type: name, value: monthCounts[index] })));
    } catch (error) {
      message.error('Erro ao carregar aniversariantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = data;

    // Filter by name
    if (searchText) {
      result = result.filter(item =>
        item.Nome.toString().toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by Month and Period
    if (selectedMonth !== null) {
      result = result.filter(item => {
        // Parse date (assuming diverse formats, trying to be robust)
        // Adjust this parsing logic based on your actual Excel date format
        // Excel often returns serial numbers, but xlsx library might convert content
        // Assuming string format or javascript Date object if parsed
        let date: Date;
        if (typeof item.DataNascimento === 'number') {
          // Excel serial date to JS Date
          date = new Date(Math.round((item.DataNascimento - 25569) * 86400 * 1000));
        } else {
          date = new Date(item.DataNascimento);
        }

        // Check if valid date
        if (isNaN(date.getTime())) return false;

        const itemMonth = date.getMonth(); // 0-11
        const itemDay = date.getDate(); // 1-31

        if (itemMonth !== selectedMonth) return false;

        if (period === 'first_half') {
          return itemDay <= 15;
        } else if (period === 'second_half') {
          return itemDay > 15;
        }
        return true;
      });
    }

    setFilteredData(result);
  }, [searchText, selectedMonth, period, data]);

  const handleExport = () => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    let filename = 'aniversariantes';

    if (selectedMonth !== null) {
      filename += `_${monthNames[selectedMonth]}`;
    }

    if (period === 'first_half') {
      filename += '_1a_quinzena';
    } else if (period === 'second_half') {
      filename += '_2a_quinzena';
    } else if (selectedMonth !== null) {
      filename += '_mes_todo';
    }

    /* 
       Removing searchText from filename to avoid weird filenames if user types special chars.
       The user asked for "what filter selected", implying the dropdowns.
    */

    exportService.downloadCsv(filteredData, filename);
  };

  const columns: ColumnsType<BirthdayData> = [
    {
      title: 'Nome',
      dataIndex: 'Nome',
      key: 'Nome',
      sorter: (a, b) => a.Nome.localeCompare(b.Nome),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.Nome.toString().toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'Data Nascimento',
      dataIndex: 'DataNascimento',
      key: 'DataNascimento',
    },
    {
      title: 'Celular',
      dataIndex: 'Celular',
      key: 'Celular',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Editar
        </Button>
      )
    }
  ];

  const birthdayConfig = {
    data: birthdayChartData,
    xField: 'type',
    yField: 'value',
    label: {
      text: (originData: any) => { return originData.value; },
      style: { fill: '#fff' },
    },
    color: '#faad14',
    columnStyle: { radius: [4, 4, 0, 0] },
    height: 200,
  };

  const totalIssues =
    qualityStats.emptyNames.length +
    qualityStats.emptyPhones.length +
    qualityStats.duplicateNames.length +
    qualityStats.duplicatePhones.length +
    qualityStats.invalidDates.length;

  return (
    <div style={{ width: '100%', padding: isMobile ? '0 8px' : '0', paddingBottom: isMobile ? 80 : 0 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Painel de Aniversariantes</Title>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card bodyStyle={{ padding: isMobile ? '12px 8px' : 24 }}>
              <Statistic title="Clientes" value={data.length} valueStyle={{ fontSize: isMobile ? 20 : 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bodyStyle={{ padding: isMobile ? '12px 8px' : 24 }}>
              <Statistic
                title="Problemas"
                value={totalIssues}
                valueStyle={{ color: totalIssues > 0 ? '#cf1322' : '#3f8600', fontSize: isMobile ? 20 : 24 }}
                prefix={totalIssues > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card title="Distribuição Anual" bodyStyle={{ padding: isMobile ? '12px 8px' : 24 }}>
              <Column {...birthdayConfig} height={isMobile ? 140 : 200} />
            </Card>
          </Col>
        </Row>
      </div>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'Lista de Contatos',
            children: (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <Space wrap style={{ width: '100%' }}>
                    <Input
                      placeholder="Buscar por nome..."
                      prefix={<SearchOutlined />}
                      style={{ width: isMobile ? '100%' : 200 }}
                      onChange={e => setSearchText(e.target.value)}
                    />
                    <Select
                      placeholder="Mês"
                      style={{ width: isMobile ? '48%' : 120 }}
                      allowClear
                      onChange={val => setSelectedMonth(val)}
                      options={[
                        { value: 0, label: 'Janeiro' },
                        { value: 1, label: 'Fevereiro' },
                        { value: 2, label: 'Março' },
                        { value: 3, label: 'Abril' },
                        { value: 4, label: 'Maio' },
                        { value: 5, label: 'Junho' },
                        { value: 6, label: 'Julho' },
                        { value: 7, label: 'Agosto' },
                        { value: 8, label: 'Setembro' },
                        { value: 9, label: 'Outubro' },
                        { value: 10, label: 'Novembro' },
                        { value: 11, label: 'Dezembro' },
                      ]}
                    />
                    <Select
                      defaultValue="all"
                      style={{ width: isMobile ? '48%' : 150 }}
                      onChange={val => setPeriod(val as 'first_half' | 'second_half' | 'all')}
                      options={[
                        { value: 'all', label: 'Todo o Mês' },
                        { value: 'first_half', label: '1ª Quinz. (1-15)' },
                        { value: 'second_half', label: '2ª Quinz. (16+)' },
                      ]}
                    />
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleExport}
                      disabled={filteredData.length === 0}
                      style={{ width: isMobile ? '100%' : 'auto' }}
                    >
                      Exportar ({filteredData.length})
                    </Button>
                  </Space>
                </div>

                <Card bodyStyle={{ padding: isMobile ? 8 : 24 }}>
                  {isMobile ? (
                    <List
                      grid={{ gutter: 12, column: 1 }}
                      dataSource={filteredData}
                      loading={loading}
                      pagination={{ pageSize: 10, size: 'small', showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}` }}
                      renderItem={(item: BirthdayData) => (
                        <List.Item style={{ padding: 0, marginBottom: 16 }}>
                          <Card size="small" style={{ width: '100%', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                              <div style={{ maxWidth: '75%' }}>
                                <Typography.Text strong style={{ fontSize: 15, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.Nome || '-'}</Typography.Text>
                                {item.Celular && (
                                  <a href={`https://wa.me/55${String(item.Celular).replace(/\\D/g, '')}`} style={{ fontSize: 13, color: '#25D366', display: 'flex', alignItems: 'center', marginTop: 6 }} target="_blank" rel="noreferrer">
                                    <WhatsAppOutlined style={{ marginRight: 4 }} /> {item.Celular}
                                  </a>
                                )}
                              </div>
                              <Typography.Text type="secondary" style={{ fontSize: 13 }}>{item.DataNascimento || '-'}</Typography.Text>
                            </div>
                            <Divider style={{ margin: '12px 0 8px' }} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(item)}>Editar</Button>
                            </div>
                          </Card>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={filteredData}
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                    />
                  )}
                </Card>
              </>
            )
          },
          {
            key: '2',
            label: (
              <Space>
                Auditoria de Qualidade
                {totalIssues > 0 && <Badge count={totalIssues} />}
              </Space>
            ),
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card title="Nomes Duplicados" extra={
                    <Space>
                      <Tag color="warning">{qualityStats.duplicateNames.length}</Tag>
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => exportService.downloadCsv(qualityStats.duplicateNames, 'auditoria_nomes_duplicados')}
                        disabled={qualityStats.duplicateNames.length === 0}
                        title="Exportar CSV"
                      />
                    </Space>
                  }>
                    <List
                      dataSource={qualityStats.duplicateNames}
                      renderItem={item => <List.Item><Typography.Text>{item.Nome}</Typography.Text></List.Item>}
                      style={{ maxHeight: 300, overflow: 'auto' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card title="Telefones Duplicados" extra={
                    <Space>
                      <Tag color="warning">{qualityStats.duplicatePhones.length}</Tag>
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => exportService.downloadCsv(qualityStats.duplicatePhones, 'auditoria_telefones_duplicados')}
                        disabled={qualityStats.duplicatePhones.length === 0}
                        title="Exportar CSV"
                      />
                    </Space>
                  }>
                    <List
                      dataSource={qualityStats.duplicatePhones}
                      renderItem={item => <List.Item><Typography.Text>{item.Nome} - {item.Celular}</Typography.Text></List.Item>}
                      style={{ maxHeight: 300, overflow: 'auto' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card title="Nomes em Branco" extra={
                    <Space>
                      <Tag color="error">{qualityStats.emptyNames.length}</Tag>
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => exportService.downloadCsv(qualityStats.emptyNames, 'auditoria_nomes_em_branco')}
                        disabled={qualityStats.emptyNames.length === 0}
                        title="Exportar CSV"
                      />
                    </Space>
                  }>
                    <List
                      dataSource={qualityStats.emptyNames}
                      renderItem={_item => <List.Item><Typography.Text type="secondary">Registro sem nome</Typography.Text></List.Item>}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card title="Telefones em Branco" extra={
                    <Space>
                      <Tag color="error">{qualityStats.emptyPhones.length}</Tag>
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => exportService.downloadCsv(qualityStats.emptyPhones, 'auditoria_telefones_em_branco')}
                        disabled={qualityStats.emptyPhones.length === 0}
                        title="Exportar CSV"
                      />
                    </Space>
                  }>
                    <List
                      dataSource={qualityStats.emptyPhones}
                      renderItem={item => <List.Item><Typography.Text>{item.Nome}</Typography.Text></List.Item>}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card title="Datas Inválidas" extra={
                    <Space>
                      <Tag color="error">{qualityStats.invalidDates.length}</Tag>
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => exportService.downloadCsv(qualityStats.invalidDates, 'auditoria_datas_invalidas')}
                        disabled={qualityStats.invalidDates.length === 0}
                        title="Exportar CSV"
                      />
                    </Space>
                  }>
                    <List
                      dataSource={qualityStats.invalidDates}
                      renderItem={item => <List.Item><Typography.Text>{item.Nome} ({item.DataNascimento})</Typography.Text></List.Item>}
                    />
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />
      <Modal title="Editar Contato" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="Nome" label="Nome" rules={[{ required: true, message: 'Nome é obrigatório' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="Celular" label="Celular">
            <Input />
          </Form.Item>
          <Form.Item name="DataNascimento" label="Data de Nascimento">
            <Input placeholder="Ex: 25/12/1990 ou Número Excel" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block icon={<SaveOutlined />}>Salvar Alterações</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Birthdays;
