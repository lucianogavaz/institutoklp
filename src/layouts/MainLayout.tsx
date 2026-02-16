import React, { useState } from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import {
    BarChartOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    LogoutOutlined,
    UserOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/',
            icon: <BarChartOutlined />,
            label: 'Dashboard Comercial',
            onClick: () => navigate('/'),
        },
        {
            key: '/comercial',
            icon: <ShoppingOutlined />,
            label: 'Ações Comerciais',
            onClick: () => navigate('/comercial'),
        },
        {
            key: '/birthdays',
            icon: <UserOutlined />,
            label: 'Aniversariantes',
            onClick: () => navigate('/birthdays'),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={250} theme="dark">
                <div style={{ padding: collapsed ? '12px 8px' : '16px 20px', textAlign: 'center', transition: 'all 0.2s' }}>
                    {/* Logo Placeholder or Text */}
                    <span style={{ color: '#fff', fontSize: collapsed ? 12 : 20, fontWeight: 'bold' }}>
                        {collapsed ? 'KLP' : 'CRM KLP'}
                    </span>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    <Space>
                        <span style={{ fontWeight: 500 }}>{user?.email || 'Usuário'}</span>
                        <Button icon={<LogoutOutlined />} type="text" danger onClick={handleLogout}>Sair</Button>
                    </Space>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: '#fff',
                        borderRadius: 8,
                        overflow: 'auto'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
