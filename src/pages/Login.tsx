
import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, UserAddOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const auth = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const action = values.action; // 'login' ou 'register' vindo do tab ou form

        try {
            if (action === 'login') {
                const { error, data } = await auth.signIn(values.email, values.password);
                if (error) throw error;
                if (data.session) {
                    navigate('/');
                }
            } else {
                const { error, data } = await auth.signUp(values.email, values.password);
                if (error) throw error;
                if (data.user) {
                    setSuccess('Conta criada! Verifique seu email para confirmar o cadastro (se necessário) ou faça login.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Falha na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (values: any) => onFinish({ ...values, action: 'login' });
    const handleRegister = (values: any) => onFinish({ ...values, action: 'register' });

    const handleReset = async (values: any) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const { error } = await auth.resetPassword(values.email);
            if (error) throw error;
            setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
        } catch (err: any) {
            setError(err.message || 'Falha ao enviar email de recuperação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            height: '100vh', background: '#f0f2f5'
        }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <img src="/logo.png" alt="CRM KLP" style={{ maxWidth: 200, height: 'auto', marginBottom: 16 }} />
            </div>

            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} closable onClose={() => setError(null)} />}
                {success && <Alert message={success} type="success" showIcon style={{ marginBottom: 16 }} closable onClose={() => setSuccess(null)} />}

                <Tabs defaultActiveKey="login" items={[
                    {
                        key: 'login',
                        label: <span><LoginOutlined /> Entrar</span>,
                        children: (
                            <Form
                                name="login"
                                initialValues={{ remember: true }}
                                onFinish={handleLogin}
                                layout="vertical"
                                size="large"
                            >
                                <Form.Item
                                    name="email"
                                    rules={[{ required: true, message: 'Digite seu email!' }, { type: 'email', message: 'Email inválido!' }]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Email" />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: 'Digite sua senha!' }]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" block loading={loading} style={{ background: '#005f5f' }}>
                                        Entrar
                                    </Button>
                                </Form.Item>
                            </Form>
                        ),
                    },
                    {
                        key: 'register',
                        label: <span><UserAddOutlined /> Cadastrar</span>,
                        children: (
                            <Form
                                name="register"
                                onFinish={handleRegister}
                                layout="vertical"
                                size="large"
                            >
                                <Form.Item
                                    name="email"
                                    rules={[{ required: true, message: 'Digite seu email para cadastrar!' }, { type: 'email' }]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Email" />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: 'Crie uma senha!' }, { min: 6, message: 'Mínimo 6 caracteres' }]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="default" htmlType="submit" block loading={loading}>
                                        Criar Conta
                                    </Button>
                                </Form.Item>
                            </Form>
                        ),
                    },
                    {
                        key: 'reset',
                        label: <span><MailOutlined /> Recuperar</span>,
                        children: (
                            <Form
                                name="reset"
                                onFinish={handleReset}
                                layout="vertical"
                                size="large"
                            >
                                <Alert
                                    message="Digite seu email para receber um link de redefinição de senha."
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                                <Form.Item
                                    name="email"
                                    rules={[{ required: true, message: 'Digite seu email!' }, { type: 'email' }]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Email cadastrado" />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="default" htmlType="submit" block loading={loading}>
                                        Enviar Link
                                    </Button>
                                </Form.Item>
                            </Form>
                        ),
                    }
                ]} />
            </Card>
        </div>
    );
};
