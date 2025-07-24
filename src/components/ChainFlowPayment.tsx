import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useChainFlowCredit } from '@/hooks/useChainFlowCredit';
import { Building2, CreditCard, Clock, CheckCircle, AlertCircle, TrendingUp, Shield, Zap } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  minOrder: number;
  image: string;
  paymentTerms: {
    cash: number;
    days30: number;
    days60: number;
    days90: number;
  };
}

interface ChainFlowPaymentProps {
  product: Product;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentData: PaymentData) => void;
}

interface PaymentData {
  product: Product;
  quantity: number;
  paymentMethod: 'cash' | 'days30' | 'days60' | 'days90';
  totalAmount: number;
  creditApproved?: boolean;
  dueDate?: string;
  applicationId?: string;
}

interface CompanyData {
  name: string;
  cnpj: string;
  monthlyRevenue: number;
}

export const ChainFlowPayment: React.FC<ChainFlowPaymentProps> = ({
  product,
  quantity,
  isOpen,
  onClose,
  onPaymentComplete
}) => {
  const { toast } = useToast();
  const { 
    analyzeCreditRequest, 
    createCreditApplication, 
    processSupplierPayment,
    checkCreditEligibility,
    getEstimatedInterestRate,
    calculateCashDiscount,
    loading 
  } = useChainFlowCredit();
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'days30' | 'days60' | 'days90'>('cash');
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    cnpj: '',
    monthlyRevenue: 0
  });
  const [creditAnalysis, setCreditAnalysis] = useState<any>(null);
  const [step, setStep] = useState<'payment' | 'company' | 'analysis' | 'confirmation'>('payment');

  // Calcular valores baseados no método de pagamento
  const getPaymentAmount = (method: string) => {
    const basePrice = product.paymentTerms[method as keyof typeof product.paymentTerms];
    return basePrice * quantity;
  };

  const getDiscountOrInterest = (method: string) => {
    const cashAmount = getPaymentAmount('cash');
    const methodAmount = getPaymentAmount(method);
    const difference = methodAmount - cashAmount;
    const percentage = (difference / cashAmount) * 100;
    
    if (method === 'cash') {
      return { type: 'none', value: 0, amount: 0 }; // Sem desconto para compradores
    }
    
    return { type: 'interest', value: percentage, amount: difference };
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method as 'cash' | 'days30' | 'days60' | 'days90');
    
    if (method === 'cash') {
      setStep('confirmation');
    } else {
      setStep('company');
      setCreditAnalysis(null);
    }
  };

  const handleCompanyDataSubmit = async () => {
    if (!companyData.name || !companyData.cnpj || !companyData.monthlyRevenue) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os dados da empresa para continuar.",
        variant: "destructive"
      });
      return;
    }

    const orderAmount = getPaymentAmount(paymentMethod);
    
    // Verificar elegibilidade
    const eligibility = checkCreditEligibility(companyData.monthlyRevenue, orderAmount);
    if (!eligibility.eligible) {
      toast({
        title: "Não elegível para crédito",
        description: eligibility.reason,
        variant: "destructive"
      });
      return;
    }

    setStep('analysis');

    try {
      const termDays = parseInt(paymentMethod.replace('days', '')) as 30 | 60 | 90;
      
      const analysis = await analyzeCreditRequest(
        companyData.name,
        companyData.cnpj,
        companyData.monthlyRevenue,
        orderAmount,
        termDays,
        `Compra de ${product.name} - ${quantity} ${product.unit}`
      );
      
      if (analysis) {
        setCreditAnalysis(analysis);
        setStep('confirmation');
      }
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Ocorreu um erro durante a análise de crédito. Tente novamente.",
        variant: "destructive"
      });
      setStep('company');
    }
  };

  const handleConfirmPayment = async () => {
    const totalAmount = getPaymentAmount(paymentMethod);
    
    if (paymentMethod === 'cash') {
      // Pagamento à vista - comprador paga preço cheio
      const paymentData: PaymentData = {
        product,
        quantity,
        paymentMethod,
        totalAmount, // Preço cheio para o comprador
        creditApproved: true,
        
      };

      onPaymentComplete(paymentData);
      toast({
        title: "Pagamento à vista confirmado",
        description: `Valor total: ${formatCurrency(totalAmount)}.`,
      });
    } else {
      // Pagamento a prazo via ChainFlow Credit
      if (!creditAnalysis?.approved) {
        toast({
          title: "Crédito não aprovado",
          description: "Não foi possível aprovar o crédito para esta compra.",
          variant: "destructive"
        });
        return;
      }

      try {
        const termDays = parseInt(paymentMethod.replace('days', '')) as 30 | 60 | 90;
        
        // Criar aplicação de crédito
        const application = await createCreditApplication(
          companyData.name,
          companyData.cnpj,
          companyData.monthlyRevenue,
          totalAmount,
          termDays,
          `Compra de ${product.name} - ${quantity} ${product.unit}`
        );

        if (application) {
          const paymentData: PaymentData = {
            product,
            quantity,
            paymentMethod,
            totalAmount,
            creditApproved: true,
            applicationId: application.id,
            dueDate: application.dueDate?.toISOString(),
          };

          onPaymentComplete(paymentData);
          
          toast({
            title: "Crédito ChainFlow aprovado!",
            description: `O fornecedor receberá à vista. Você pagará em ${termDays} dias com juros de ${creditAnalysis.interestRate}%.`,
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao processar crédito",
          description: "Ocorreu um erro ao processar o crédito. Tente novamente.",
          variant: "destructive"
        });
      }
    }
    
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setPaymentMethod('cash');
    setCompanyData({ name: '', cnpj: '', monthlyRevenue: 0 });
    setCreditAnalysis(null);
    setStep('payment');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#c1e428]" />
            ChainFlow Payment
          </DialogTitle>
        </DialogHeader>

        {/* Resumo do Produto */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-12 h-12 object-cover rounded"
          />
          <div className="flex-1">
            <h4 className="font-medium text-sm">{product.name}</h4>
            <p className="text-sm text-gray-600">{quantity} {product.unit}</p>
          </div>
        </div>

        {/* Step 1: Escolha do método de pagamento */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Escolha a forma de pagamento:</Label>
            </div>
            
            <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange}>
              {/* À vista */}
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="cash" id="cash" />
                <div className="flex-1">
                  <Label htmlFor="cash" className="font-medium text-blue-600 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    À vista - {formatCurrency(getPaymentAmount('cash'))}
                  </Label>
                  <p className="text-sm text-blue-600">
                    Pagamento imediato
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>

              {/* 30 dias */}
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="days30" id="days30" />
                <div className="flex-1">
                  <Label htmlFor="days30" className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    30 dias - {formatCurrency(getPaymentAmount('days30'))}
                  </Label>
                  <p className="text-sm text-gray-600">
                    Juros: +{getDiscountOrInterest('days30').value.toFixed(1)}% • ChainFlow financia
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>

              {/* 60 dias */}
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="days60" id="days60" />
                <div className="flex-1">
                  <Label htmlFor="days60" className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    60 dias - {formatCurrency(getPaymentAmount('days60'))}
                  </Label>
                  <p className="text-sm text-gray-600">
                    Juros: +{getDiscountOrInterest('days60').value.toFixed(1)}% • ChainFlow financia
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>

              {/* 90 dias */}
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="days90" id="days90" />
                <div className="flex-1">
                  <Label htmlFor="days90" className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-500" />
                    90 dias - {formatCurrency(getPaymentAmount('days90'))}
                  </Label>
                  <p className="text-sm text-gray-600">
                    Juros: +{getDiscountOrInterest('days90').value.toFixed(1)}% • ChainFlow financia
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-red-500" />
              </div>
            </RadioGroup>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Como funciona o ChainFlow Credit:</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• O fornecedor recebe o pagamento à vista</li>
                    <li>• Você paga para ChainFlow na data de vencimento</li>
                    <li>• Análise de crédito automática com IA</li>
                    <li>• Liquidez garantida pelos Credit Pools DeFi</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Dados da empresa */}
        {step === 'company' && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Dados da empresa para análise de crédito:</Label>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  placeholder="Ex: Restaurante do João Ltda"
                />
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={companyData.cnpj}
                  onChange={(e) => setCompanyData({...companyData, cnpj: e.target.value})}
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div>
                <Label htmlFor="revenue">Faturamento Mensal (R$)</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={companyData.monthlyRevenue}
                  onChange={(e) => setCompanyData({...companyData, monthlyRevenue: Number(e.target.value)})}
                  placeholder="50000"
                />
              </div>
            </div>

            {companyData.monthlyRevenue > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Taxa estimada:</strong> {getEstimatedInterestRate(
                    companyData.monthlyRevenue, 
                    getPaymentAmount(paymentMethod), 
                    parseInt(paymentMethod.replace('days', '')) as 30 | 60 | 90
                  )}% para {paymentMethod.replace('days', '')} dias
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button 
                onClick={handleCompanyDataSubmit} 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Analisando...' : 'Analisar Crédito'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Análise de crédito */}
        {step === 'analysis' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c1e428] mx-auto mb-4"></div>
              <h3 className="text-lg font-medium">Analisando seu crédito...</h3>
              <p className="text-sm text-gray-600 mt-2">
                Nossa IA está avaliando os dados da sua empresa usando tecnologia blockchain
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <p>✓ Verificando dados da empresa</p>
                <p>✓ Calculando business score</p>
                <p>✓ Consultando Credit Pools DeFi</p>
                <p>✓ Definindo taxa de juros</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmação */}
        {step === 'confirmation' && (
          <div className="space-y-4">
            {paymentMethod !== 'cash' && creditAnalysis && (
              <div className={`p-4 border rounded-lg ${creditAnalysis.approved ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {creditAnalysis.approved ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <h3 className="font-medium">
                    {creditAnalysis.approved ? 'Crédito Aprovado!' : 'Crédito Negado'}
                  </h3>
                </div>
                
                {creditAnalysis.approved && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Business Score:</span>
                      <span className="font-medium ml-2">{creditAnalysis.businessScore}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Taxa de Juros:</span>
                      <span className="font-medium ml-2">{creditAnalysis.interestRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Nível de Risco:</span>
                      <span className="font-medium ml-2">{creditAnalysis.riskLevel}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Valor Aprovado:</span>
                      <span className="font-medium ml-2">{formatCurrency(creditAnalysis.maxAmount || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Resumo do Pagamento:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span className="font-medium">
                    {paymentMethod === 'cash' ? 'À vista' : 
                     `${paymentMethod.replace('days', '')} dias`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Valor Total:</span>
                  <span className="font-medium">
                    {paymentMethod === 'cash' ? 
                      formatCurrency(getPaymentAmount(paymentMethod) - getDiscountOrInterest(paymentMethod).amount) :
                      formatCurrency(getPaymentAmount(paymentMethod))
                    }
                  </span>
                </div>
                {paymentMethod === 'cash' && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto:</span>
                    <span className="font-medium">-{formatCurrency(getDiscountOrInterest(paymentMethod).amount)}</span>
                  </div>
                )}
                {paymentMethod !== 'cash' && (
                  <div className="flex justify-between">
                    <span>Data de Vencimento:</span>
                    <span className="font-medium">
                      {new Date(Date.now() + parseInt(paymentMethod.replace('days', '')) * 24 * 60 * 60 * 1000)
                        .toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(!creditAnalysis || creditAnalysis.approved) && (
              <Button 
                onClick={handleConfirmPayment} 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </Button>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

