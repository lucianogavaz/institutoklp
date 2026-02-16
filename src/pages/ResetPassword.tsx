
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Alert, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a hash fragment (Supabase auth redirect)
        if (!window.location.hash) {
            // If no hash, maybe user just navigated here manually. 
            // We can redirect to login or show message.
        }
    }, []);

    const onFinish = async (values: any) => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: values.password
            });

            if (error) throw error;

            message.success('Senha atualizada com sucesso! Redirecionando para o login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Falha ao atualizar senha.');
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
                <h2>Redefinir Senha</h2>
            </div>

            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} closable onClose={() => setError(null)} />}

                <Form
                    name="reset-password"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Alert
                        message="Digite sua nova senha abaixo."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Digite sua nova senha!' }, { min: 6, message: 'Mínimo 6 caracteres' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Nova Senha" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Confirme sua senha!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('As senhas não coincidem!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Senha" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading} style={{ background: '#005f5f' }}>
                            Atualizar Senha
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ResetPassword;
