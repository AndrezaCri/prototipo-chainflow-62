import { ChainFlowCreditService } from './chainflowCredit';

// Interfaces para PIX
export interface PixPayment {
  id: string;
  type: 'supplier' | 'buyer';
  applicationId?: string;
  recipientId: string;
  amount: number;
  pixCode: string;
  qrCode?: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
  dueDate?: Date;
  description: string;
}

export interface PixCharge {
  id: string;
  buyerCnpj: string;
  amount: number;
  dueDate: Date;
  pixCode: string;
  qrCode: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  applicationId: string;
  createdAt: Date;
  paidAt?: Date;
  remindersSent: number;
}

export interface SupplierPaymentRequest {
  supplierId: string;
  supplierName: string;
  supplierCnpj: string;
  supplierPixKey: string;
  amount: number;
  applicationId: string;
  productDescription: string;
}

// Simulação de base de dados
let pixPayments: PixPayment[] = [];
let pixCharges: PixCharge[] = [];

export class PixPaymentService {
  
  /**
   * Gerar pagamento PIX para fornecedor (ChainFlow paga à vista)
   */
  static async generateSupplierPayment(request: SupplierPaymentRequest): Promise<PixPayment> {
    // Verificar se a aplicação de crédito existe e foi aprovada
    const applications = ChainFlowCreditService.getCreditApplications();
    const application = applications.find(app => app.id === request.applicationId);
    
    if (!application || application.status !== 'approved') {
      throw new Error('Credit application not found or not approved');
    }

    // Gerar código PIX para o fornecedor
    const pixCode = this.generatePixCode(
      request.amount,
      request.supplierPixKey,
      `ChainFlow - Pagamento ${request.productDescription}`
    );

    const payment: PixPayment = {
      id: `pix_supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'supplier',
      applicationId: request.applicationId,
      recipientId: request.supplierId,
      amount: request.amount,
      pixCode,
      qrCode: this.generateQRCode(pixCode),
      status: 'pending',
      createdAt: new Date(),
      description: `Pagamento à vista - ${request.productDescription}`
    };

    pixPayments.push(payment);

    // Simular processamento automático do PIX (ChainFlow tem liquidez)
    setTimeout(() => {
      this.processSupplierPayment(payment.id);
    }, 3000); // 3 segundos para simular processamento

    return payment;
  }

  /**
   * Processar pagamento do fornecedor (marcar como pago)
   */
  static processSupplierPayment(paymentId: string): void {
    const payment = pixPayments.find(p => p.id === paymentId);
    if (!payment) return;

    payment.status = 'paid';
    payment.paidAt = new Date();

    // Atualizar status da aplicação para ativo
    if (payment.applicationId) {
      const applications = ChainFlowCreditService.getCreditApplications();
      const application = applications.find(app => app.id === payment.applicationId);
      if (application) {
        application.status = 'active';
      }
    }

    console.log(`Supplier payment processed: ${paymentId}`);
  }

  /**
   * Gerar cobrança PIX para comprador (na data de vencimento)
   */
  static async generateBuyerCharge(
    applicationId: string,
    buyerCnpj: string,
    amount: number,
    dueDate: Date
  ): Promise<PixCharge> {
    
    const pixCode = this.generatePixCode(
      amount,
      'chainflow@pix.com.br', // PIX da ChainFlow
      `Pagamento ChainFlow - Vencimento ${dueDate.toLocaleDateString('pt-BR')}`
    );

    const charge: PixCharge = {
      id: `pix_charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      buyerCnpj,
      amount,
      dueDate,
      pixCode,
      qrCode: this.generateQRCode(pixCode),
      status: 'pending',
      applicationId,
      createdAt: new Date(),
      remindersSent: 0
    };

    pixCharges.push(charge);

    // Agendar lembretes automáticos
    this.schedulePaymentReminders(charge.id);

    return charge;
  }

  /**
   * Processar pagamento do comprador
   */
  static async processBuyerPayment(
    chargeId: string,
    paidAmount: number,
    paymentProof?: string
  ): Promise<boolean> {
    
    const charge = pixCharges.find(c => c.id === chargeId);
    if (!charge) {
      throw new Error('Charge not found');
    }

    // Verificar valor
    if (Math.abs(paidAmount - charge.amount) > 0.01) {
      throw new Error('Payment amount mismatch');
    }

    // Marcar como pago
    charge.status = 'paid';
    charge.paidAt = new Date();

    // Processar no serviço de crédito
    try {
      await ChainFlowCreditService.processBuyerPayment(charge.applicationId, paidAmount);
      return true;
    } catch (error) {
      console.error('Error processing buyer payment:', error);
      return false;
    }
  }

  /**
   * Agendar lembretes de pagamento
   */
  private static schedulePaymentReminders(chargeId: string): void {
    const charge = pixCharges.find(c => c.id === chargeId);
    if (!charge) return;

    const now = new Date();
    const dueDate = charge.dueDate;
    const timeToDue = dueDate.getTime() - now.getTime();

    // Lembrete 3 dias antes
    const reminder3Days = timeToDue - (3 * 24 * 60 * 60 * 1000);
    if (reminder3Days > 0) {
      setTimeout(() => {
        this.sendPaymentReminder(chargeId, '3 dias');
      }, reminder3Days);
    }

    // Lembrete 1 dia antes
    const reminder1Day = timeToDue - (1 * 24 * 60 * 60 * 1000);
    if (reminder1Day > 0) {
      setTimeout(() => {
        this.sendPaymentReminder(chargeId, '1 dia');
      }, reminder1Day);
    }

    // Lembrete no dia do vencimento
    if (timeToDue > 0) {
      setTimeout(() => {
        this.sendPaymentReminder(chargeId, 'hoje');
      }, timeToDue);
    }

    // Marcar como vencido após a data
    setTimeout(() => {
      this.markAsOverdue(chargeId);
    }, timeToDue + (24 * 60 * 60 * 1000)); // 1 dia após vencimento
  }

  /**
   * Enviar lembrete de pagamento
   */
  private static sendPaymentReminder(chargeId: string, timeframe: string): void {
    const charge = pixCharges.find(c => c.id === chargeId);
    if (!charge || charge.status !== 'pending') return;

    charge.remindersSent += 1;

    // Simular envio de notificação/email/SMS
    console.log(`Payment reminder sent for charge ${chargeId}: Due ${timeframe}`);
    
    // Aqui você integraria com serviços de notificação reais
    // - Email via SendGrid/AWS SES
    // - SMS via Twilio
    // - WhatsApp Business API
    // - Push notifications
  }

  /**
   * Marcar cobrança como vencida
   */
  private static markAsOverdue(chargeId: string): void {
    const charge = pixCharges.find(c => c.id === chargeId);
    if (!charge || charge.status !== 'pending') return;

    charge.status = 'overdue';

    // Notificar sistema de inadimplência
    this.handleOverduePayment(chargeId);
  }

  /**
   * Tratar pagamento em atraso
   */
  private static handleOverduePayment(chargeId: string): void {
    const charge = pixCharges.find(c => c.id === chargeId);
    if (!charge) return;

    // Marcar aplicação como inadimplente
    const applications = ChainFlowCreditService.getCreditApplications();
    const application = applications.find(app => app.id === charge.applicationId);
    if (application) {
      application.status = 'defaulted';
    }

    console.log(`Payment overdue: ${chargeId}`);
    
    // Aqui você implementaria:
    // - Cobrança automática
    // - Negativação em bureaus de crédito
    // - Processo de recuperação
    // - Ajuste nos pools de crédito
  }

  /**
   * Gerar código PIX
   */
  private static generatePixCode(
    amount: number,
    pixKey: string,
    description: string
  ): string {
    // Simulação de código PIX (na prática, usar biblioteca oficial do Banco Central)
    const timestamp = Date.now();
    const amountStr = amount.toFixed(2).replace('.', '');
    const random = Math.random().toString(36).substr(2, 6);
    
    return `00020126580014br.gov.bcb.pix0136${pixKey}520400005303986540${amountStr.length}${amountStr}5802BR5913ChainFlow6009SAO PAULO62070503***6304${random.toUpperCase()}`;
  }

  /**
   * Gerar QR Code (simulado)
   */
  private static generateQRCode(pixCode: string): string {
    // Na prática, usar biblioteca como qrcode.js
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  }

  /**
   * Obter pagamentos PIX
   */
  static getPixPayments(filters?: {
    type?: 'supplier' | 'buyer';
    status?: PixPayment['status'];
    applicationId?: string;
  }): PixPayment[] {
    let payments = [...pixPayments];

    if (filters?.type) {
      payments = payments.filter(p => p.type === filters.type);
    }

    if (filters?.status) {
      payments = payments.filter(p => p.status === filters.status);
    }

    if (filters?.applicationId) {
      payments = payments.filter(p => p.applicationId === filters.applicationId);
    }

    return payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Obter cobranças PIX
   */
  static getPixCharges(filters?: {
    status?: PixCharge['status'];
    buyerCnpj?: string;
    applicationId?: string;
  }): PixCharge[] {
    let charges = [...pixCharges];

    if (filters?.status) {
      charges = charges.filter(c => c.status === filters.status);
    }

    if (filters?.buyerCnpj) {
      charges = charges.filter(c => c.buyerCnpj === filters.buyerCnpj);
    }

    if (filters?.applicationId) {
      charges = charges.filter(c => c.applicationId === filters.applicationId);
    }

    return charges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Obter estatísticas de pagamentos
   */
  static getPaymentStats(): {
    totalSupplierPayments: number;
    totalBuyerCharges: number;
    pendingPayments: number;
    overduePayments: number;
    totalVolume: number;
    averagePaymentTime: number;
  } {
    const supplierPayments = pixPayments.filter(p => p.type === 'supplier');
    const buyerCharges = pixCharges;

    const pendingPayments = [
      ...pixPayments.filter(p => p.status === 'pending'),
      ...pixCharges.filter(c => c.status === 'pending')
    ].length;

    const overduePayments = pixCharges.filter(c => c.status === 'overdue').length;

    const totalVolume = [
      ...pixPayments,
      ...pixCharges
    ].reduce((sum, payment) => sum + payment.amount, 0);

    // Calcular tempo médio de pagamento
    const paidPayments = pixPayments.filter(p => p.status === 'paid' && p.paidAt);
    const averagePaymentTime = paidPayments.length > 0 ?
      paidPayments.reduce((sum, p) => {
        const timeDiff = p.paidAt!.getTime() - p.createdAt.getTime();
        return sum + timeDiff;
      }, 0) / paidPayments.length / (1000 * 60 * 60) : 0; // em horas

    return {
      totalSupplierPayments: supplierPayments.length,
      totalBuyerCharges: buyerCharges.length,
      pendingPayments,
      overduePayments,
      totalVolume,
      averagePaymentTime: Number(averagePaymentTime.toFixed(1))
    };
  }

  /**
   * Simular webhook de confirmação de pagamento PIX
   */
  static simulatePixWebhook(
    pixCode: string,
    paidAmount: number,
    paymentProof: string
  ): boolean {
    // Encontrar pagamento ou cobrança correspondente
    const payment = pixPayments.find(p => p.pixCode === pixCode);
    const charge = pixCharges.find(c => c.pixCode === pixCode);

    if (payment) {
      payment.status = 'paid';
      payment.paidAt = new Date();
      this.processSupplierPayment(payment.id);
      return true;
    }

    if (charge) {
      return this.processBuyerPayment(charge.id, paidAmount, paymentProof)
        .then(() => true)
        .catch(() => false);
    }

    return false;
  }

  /**
   * Cancelar pagamento/cobrança
   */
  static cancelPixTransaction(transactionId: string, reason: string): boolean {
    const payment = pixPayments.find(p => p.id === transactionId);
    const charge = pixCharges.find(c => c.id === transactionId);

    if (payment && payment.status === 'pending') {
      payment.status = 'cancelled';
      return true;
    }

    if (charge && charge.status === 'pending') {
      charge.status = 'cancelled';
      return true;
    }

    return false;
  }

  /**
   * Reenviar cobrança PIX
   */
  static resendPixCharge(chargeId: string): boolean {
    const charge = pixCharges.find(c => c.id === chargeId);
    if (!charge || charge.status !== 'pending') {
      return false;
    }

    // Gerar novo código PIX com nova data
    charge.pixCode = this.generatePixCode(
      charge.amount,
      'chainflow@pix.com.br',
      `Pagamento ChainFlow - Vencimento ${charge.dueDate.toLocaleDateString('pt-BR')}`
    );
    charge.qrCode = this.generateQRCode(charge.pixCode);

    // Enviar notificação
    this.sendPaymentReminder(chargeId, 'reenvio');

    return true;
  }
}

