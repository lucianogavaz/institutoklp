
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Typography, Card, Button } from "antd";

const { Title, Paragraph, Text } = Typography;

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "50px", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5" }}>
                    <Card title="Algo deu errado" style={{ width: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                        <Title level={4} type="danger">Ocorreu um erro na aplicação.</Title>
                        <Paragraph>
                            <Text strong>Erro:</Text> {this.state.error?.toString()}
                        </Paragraph>
                        {this.state.errorInfo && (
                            <details style={{ whiteSpace: "pre-wrap", marginTop: "10px", color: "#666" }}>
                                {this.state.errorInfo.componentStack}
                            </details>
                        )}
                        <Button type="primary" onClick={() => window.location.reload()} style={{ marginTop: "20px" }}>
                            Recarregar Página
                        </Button>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
