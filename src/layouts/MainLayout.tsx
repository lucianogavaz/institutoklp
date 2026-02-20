import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Grid } from 'antd';
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
import { useMediaQuery } from 'react-responsive';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();
    const screens = useBreakpoint();
    const isMobile = useMediaQuery({ maxWidth: 768 }) || !screens.md;

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/',
            icon: <BarChartOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/'),
        },
        {
            key: '/comercial',
            icon: <ShoppingOutlined />,
            label: 'Ações',
            onClick: () => navigate('/comercial'),
        },
        {
            key: '/birthdays',
            icon: <UserOutlined />,
            label: 'Níver',
            onClick: () => navigate('/birthdays'),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', paddingBottom: isMobile ? 60 : 0 }}>
            {!isMobile && (
                <Sider trigger={null} collapsible collapsed={collapsed} width={220} theme="dark" style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10 }}>
                    <div style={{ padding: collapsed ? '12px 8px' : '16px 20px', textAlign: 'center', transition: 'all 0.2s', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: collapsed ? 12 : 18, fontWeight: 'bold' }}>
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
            )}

            <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 220), transition: 'margin-left 0.2s' }}>
                <Header style={{
                    padding: '0 16px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 64,
                    boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 5
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {!isMobile && (
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{ fontSize: '16px', width: 64, height: 64, marginLeft: -16 }}
                            />
                        )}
                        {isMobile && (
                            <span style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>CRM KLP</span>
                        )}
                    </div>

                    <Space>
                        <span style={{ fontWeight: 500, fontSize: isMobile ? 12 : 14 }}>{user?.email?.split('@')[0] || 'Usuário'}</span>
                        <Button icon={<LogoutOutlined />} type="text" danger onClick={handleLogout}>{isMobile ? '' : 'Sair'}</Button>
                    </Space>
                </Header>
                <Content
                    style={{
                        margin: isMobile ? '12px' : '24px 16px',
                        padding: isMobile ? 12 : 24,
                        minHeight: 280,
                        background: '#fff',
                        borderRadius: 8,
                        overflowX: 'hidden'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>

            {isMobile && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: '100%',
                    background: '#001529',
                    zIndex: 1000,
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.15)'
                }}>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={menuItems.map(item => ({
                            ...item,
                            style: { flex: 1, textAlign: 'center', padding: '0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 'normal', height: 60 }
                        }))}
                        style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: 'none' }}
                    />
                </div>
            )}
        </Layout>
    );
};

export default MainLayout;
