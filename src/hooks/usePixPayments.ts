import { useState, useEffect, useCallback } from 'react';
import { 
  PixPaymentService, 
  PixPayment, 
  PixCharge, 
  SupplierPaymentRequest 
} from '../services/pixPayments';

export const usePixPayments = () => {
  const [pixPayments, setPixPayments] = useState<PixPayment[]>([]);
  const [pixCharges, setPixCharges] = useState<PixCharge[]>([]);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadPixPayments();
    loadPixCharges();
    loadPaymentStats();
  }, []);

  const loadPixPayments = useCallback((filters?: {
    type?: 'supplier' | 'buyer';
    status?: PixPayment['status'];
    applicationId?: string;
  }) => {
    try {
      const payments = PixPaymentService.getPixPayments(filters);
      setPixPayments(payments);
    } catch (err) {
      setError('Erro ao carregar pagamentos PIX');
      console.error('Error loading PIX payments:', err);
    }
  }, []);

  const loadPixCharges = useCallback((filters?: {
    status?: PixCharge['status'];
    buyerCnpj?: string;
    applicationId?: string;
  }) => {
    try {
      const charges = PixPaymentService.getPixCharges(filters);
      setPixCharges(charges);
    } catch (err) {
      setError('Erro ao carregar cobranças PIX');
      console.error('Error loading PIX charges:', err);
    }
  }, []);

  const loadPaymentStats = useCallback(() => {
    try {
      const stats = PixPaymentService.getPaymentStats();
      setPaymentStats(stats);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error('Error loading payment stats:', err);
    }
  }, []);

  // Gerar pagamento para fornecedor
  const generateSupplierPayment = useCallback(async (
    request: SupplierPaymentRequest
  ): Promise<PixPayment | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const payment = await PixPaymentService.generateSupplierPayment(request);
      
      // Recarregar dados
      loadPixPayments();
      loadPaymentStats();
      
      return payment;
    } catch (err) {
      setError('Erro ao gerar pagamento para fornecedor');
      console.error('Error generating supplier payment:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadPixPayments, loadPaymentStats]);

  // Gerar cobrança para comprador
  const generateBuyerCharge = useCallback(async (
    applicationId: string,
    buyerCnpj: string,
    amount: number,
    dueDate: Date
  ): Promise<PixCharge | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const charge = await PixPaymentService.generateBuyerCharge(
        applicationId, buyerCnpj, amount, dueDate
      );
      
      // Recarregar dados
      loadPixCharges();
      loadPaymentStats();
      
      return charge;
    } catch (err) {
      setError('Erro ao gerar cobrança para comprador');
      console.error('Error generating buyer charge:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadPixCharges, loadPaymentStats]);

  // Processar pagamento do comprador
  const processBuyerPayment = useCallback(async (
    chargeId: string,
    paidAmount: number,
    paymentProof?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await PixPaymentService.processBuyerPayment(
        chargeId, paidAmount, paymentProof
      );
      
      if (success) {
        // Recarregar dados
        loadPixCharges();
        loadPaymentStats();
      }
      
      return success;
    } catch (err) {
      setError('Erro ao processar pagamento do comprador');
      console.error('Error processing buyer payment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadPixCharges, loadPaymentStats]);

  // Simular webhook PIX
  const simulatePixWebhook = useCallback(async (
    pixCode: string,
    paidAmount: number,
    paymentProof: string
  ): Promise<boolean> => {
    try {
      const success = await PixPaymentService.simulatePixWebhook(
        pixCode, paidAmount, paymentProof
      );
      
      if (success) {
        // Recarregar dados
        loadPixPayments();
        loadPixCharges();
        loadPaymentStats();
      }
      
      return success;
    } catch (err) {
      setError('Erro ao simular webhook PIX');
      console.error('Error simulating PIX webhook:', err);
      return false;
    }
  }, [loadPixPayments, loadPixCharges, loadPaymentStats]);

  // Cancelar transação PIX
  const cancelPixTransaction = useCallback((
    transactionId: string,
    reason: string
  ): boolean => {
    try {
      const success = PixPaymentService.cancelPixTransaction(transactionId, reason);
      
      if (success) {
        // Recarregar dados
        loadPixPayments();
        loadPixCharges();
        loadPaymentStats();
      }
      
      return success;
    } catch (err) {
      setError('Erro ao cancelar transação PIX');
      console.error('Error cancelling PIX transaction:', err);
      return false;
    }
  }, [loadPixPayments, loadPixCharges, loadPaymentStats]);

  // Reenviar cobrança PIX
  const resendPixCharge = useCallback((chargeId: string): boolean => {
    try {
      const success = PixPaymentService.resendPixCharge(chargeId);
      
      if (success) {
        // Recarregar dados
        loadPixCharges();
      }
      
      return success;
    } catch (err) {
      setError('Erro ao reenviar cobrança PIX');
      console.error('Error resending PIX charge:', err);
      return false;
    }
  }, [loadPixCharges]);

  // Utilitários
  const formatPixCode = useCallback((pixCode: string): string => {
    // Formatar código PIX para exibição
    return pixCode.replace(/(.{4})/g, '$1 ').trim();
  }, []);

  const getPaymentStatus = useCallback((payment: PixPayment | PixCharge) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'yellow' },
      paid: { label: 'Pago', color: 'green' },
      overdue: { label: 'Vencido', color: 'red' },
      expired: { label: 'Expirado', color: 'gray' },
      cancelled: { label: 'Cancelado', color: 'gray' }
    };
    
    return statusMap[payment.status] || { label: 'Desconhecido', color: 'gray' };
  }, []);

  const isPaymentOverdue = useCallback((charge: PixCharge): boolean => {
    return new Date() > charge.dueDate && charge.status === 'pending';
  }, []);

  const getDaysUntilDue = useCallback((charge: PixCharge): number => {
    const now = new Date();
    const dueDate = charge.dueDate;
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const getPaymentsByStatus = useCallback((status: PixPayment['status']) => {
    return pixPayments.filter(p => p.status === status);
  }, [pixPayments]);

  const getChargesByStatus = useCallback((status: PixCharge['status']) => {
    return pixCharges.filter(c => c.status === status);
  }, [pixCharges]);

  // Filtros e buscas
  const searchPayments = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return pixPayments.filter(payment => 
      payment.id.toLowerCase().includes(lowerQuery) ||
      payment.description.toLowerCase().includes(lowerQuery) ||
      payment.recipientId.toLowerCase().includes(lowerQuery)
    );
  }, [pixPayments]);

  const searchCharges = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return pixCharges.filter(charge => 
      charge.id.toLowerCase().includes(lowerQuery) ||
      charge.buyerCnpj.toLowerCase().includes(lowerQuery) ||
      charge.applicationId.toLowerCase().includes(lowerQuery)
    );
  }, [pixCharges]);

  const getPaymentsByDateRange = useCallback((
    startDate: Date,
    endDate: Date
  ) => {
    return pixPayments.filter(payment => {
      const paymentDate = payment.createdAt;
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  }, [pixPayments]);

  const getChargesByDateRange = useCallback((
    startDate: Date,
    endDate: Date
  ) => {
    return pixCharges.filter(charge => {
      const chargeDate = charge.createdAt;
      return chargeDate >= startDate && chargeDate <= endDate;
    });
  }, [pixCharges]);

  // Métricas calculadas
  const getTotalVolume = useCallback((period?: 'today' | 'week' | 'month') => {
    let payments = pixPayments;
    let charges = pixCharges;
    
    if (period) {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      payments = getPaymentsByDateRange(startDate, now);
      charges = getChargesByDateRange(startDate, now);
    }
    
    const paymentVolume = payments.reduce((sum, p) => sum + p.amount, 0);
    const chargeVolume = charges.reduce((sum, c) => sum + c.amount, 0);
    
    return paymentVolume + chargeVolume;
  }, [pixPayments, pixCharges, getPaymentsByDateRange, getChargesByDateRange]);

  const getSuccessRate = useCallback(() => {
    const totalTransactions = pixPayments.length + pixCharges.length;
    const successfulTransactions = [
      ...pixPayments.filter(p => p.status === 'paid'),
      ...pixCharges.filter(c => c.status === 'paid')
    ].length;
    
    return totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
  }, [pixPayments, pixCharges]);

  return {
    // Estados
    pixPayments,
    pixCharges,
    paymentStats,
    loading,
    error,
    
    // Ações principais
    generateSupplierPayment,
    generateBuyerCharge,
    processBuyerPayment,
    simulatePixWebhook,
    cancelPixTransaction,
    resendPixCharge,
    
    // Utilitários
    formatPixCode,
    getPaymentStatus,
    isPaymentOverdue,
    getDaysUntilDue,
    getPaymentsByStatus,
    getChargesByStatus,
    
    // Filtros e buscas
    searchPayments,
    searchCharges,
    getPaymentsByDateRange,
    getChargesByDateRange,
    
    // Métricas
    getTotalVolume,
    getSuccessRate,
    
    // Recarregar dados
    loadPixPayments,
    loadPixCharges,
    loadPaymentStats,
    
    // Limpar erro
    clearError: () => setError(null)
  };
};

