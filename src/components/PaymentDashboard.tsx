import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChainFlowPayment } from '@/components/ChainFlowPayment';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Shield, 
  Building2,
  Plus
} from 'lucide-react';

// Mock data for demonstration
const mockProduct = {
  id: '1',
  name: 'Produto Demo',
  category: 'industrial',
  price: 1000,
  unit: 'unidade',
  minOrder: 1,
  image: '/placeholder.svg',
  paymentTerms: {
    cash: 0,
    days30: 2.5,
    days60: 5.0,
    days90: 7.5,
  }
};

interface PaymentData {
  product: any;
  quantity: number;
  paymentMethod: 'cash' | 'days30' | 'days60' | 'days90';
  totalAmount: number;
  creditApproved?: boolean;
  pixCode?: string;
  dueDate?: string;
  applicationId?: string;
}

export const PaymentDashboard: React.FC = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentData[]>([]);

  // Mock statistics
  const stats = {
    totalTransactions: 147,
    totalVolume: 2850000,
    pendingPayments: 12,
    creditApprovalRate: 94.2,
    averageProcessingTime: 2.3
  };

  const handlePaymentComplete = (paymentData: PaymentData) => {
    setPayments(prev => [...prev, paymentData]);
    setIsPaymentModalOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pagamentos ChainFlow</h2>
          <p className="text-muted-foreground">
            Sistema de pagamentos seguro para transações B2B
          </p>
        </div>
        <Button onClick={() => setIsPaymentModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transações</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</div>
            <p className="text-xs text-muted-foreground">
              +8.5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Aprovação</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.creditApprovalRate}%</div>
            <p className="text-xs text-muted-foreground">
              De crédito aprovado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProcessingTime}h</div>
            <p className="text-xs text-muted-foreground">
              Para processamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Pagamentos PIX</CardTitle>
            </div>
            <CardDescription>
              Pagamentos instantâneos via PIX integrado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processados hoje</span>
                <span className="font-semibold">48</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">
                75% do limite diário utilizado
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Análise de Crédito</CardTitle>
            </div>
            <CardDescription>
              Sistema automatizado de aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Aprovações automáticas</span>
                <span className="font-semibold">89%</span>
              </div>
              <Progress value={89} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Baseado em IA e dados históricos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Segurança Blockchain</CardTitle>
            </div>
            <CardDescription>
              Transações verificáveis e imutáveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">100% das transações verificadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Smart contracts auditados</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Conformidade regulatória</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Últimas transações processadas pelo sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.slice(-5).map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {payment.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(payment.totalAmount)}</p>
                    <Badge variant={payment.creditApproved ? "default" : "secondary"}>
                      {payment.paymentMethod}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Sistema Integrado</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este sistema está integrado com SWAP USDC ⇄ BRZ na Base Sepolia, 
            permitindo transações fluidas entre moedas digitais e pagamentos tradicionais.
          </p>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <ChainFlowPayment
        product={mockProduct}
        quantity={1}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};