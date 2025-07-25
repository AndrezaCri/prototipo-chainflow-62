import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, DollarSign, FileText, Building, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealChainFlowCredit } from '@/hooks/useRealChainFlowCredit';
import { useAccount } from 'wagmi';
import { CreditApplicationForm } from '@/services/realChainFlowCredit';

export const CreditRequest: React.FC = () => {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { 
    createApplication, 
    loading, 
    error, 
    isInitialized,
    usdcBalance 
  } = useRealChainFlowCredit();

  const [formData, setFormData] = useState<CreditApplicationForm>({
    companyName: '',
    cnpj: '',
    monthlyRevenue: '',
    requestedAmount: '',
    termDays: 30,
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: keyof CreditApplicationForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.companyName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome da empresa é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.cnpj.trim()) {
      toast({
        title: "Campo obrigatório", 
        description: "CNPJ é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.monthlyRevenue || parseFloat(formData.monthlyRevenue) < 5000) {
      toast({
        title: "Receita insuficiente",
        description: "Receita mensal mínima: 5.000 USDC",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.requestedAmount || parseFloat(formData.requestedAmount) < 1000) {
      toast({
        title: "Valor insuficiente",
        description: "Valor mínimo de crédito: 1.000 USDC",
        variant: "destructive"
      });
      return false;
    }

    if (parseFloat(formData.requestedAmount) > 100000) {
      toast({
        title: "Valor muito alto",
        description: "Valor máximo de crédito: 100.000 USDC",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Conecte sua carteira para solicitar crédito",
        variant: "destructive"
      });
      return;
    }

    if (!isInitialized) {
      toast({
        title: "Serviço não inicializado",
        description: "Aguarde a inicialização do serviço de crédito",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const result = await createApplication(formData);

      if (result.success) {
        toast({
          title: "✅ Solicitação enviada!",
          description: `Aplicação #${result.applicationId} criada com sucesso. Análise automática em andamento.`,
        });

        // Limpar formulário
        setFormData({
          companyName: '',
          cnpj: '',
          monthlyRevenue: '',
          requestedAmount: '',
          termDays: 30,
          description: ''
        });
      } else {
        toast({
          title: "❌ Erro na solicitação",
          description: result.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "❌ Erro inesperado",
        description: err.message || "Erro ao processar solicitação",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateEstimatedInterest = (): number => {
    const amount = parseFloat(formData.requestedAmount) || 0;
    const revenue = parseFloat(formData.monthlyRevenue) || 0;
    
    if (amount === 0 || revenue === 0) return 5.0;
    
    const creditRatio = amount / revenue;
    let baseRate = 5.0; // 5% base
    
    // Ajustar por ratio
    if (creditRatio > 3) {
      baseRate += 8.0;
    } else if (creditRatio > 2) {
      baseRate += 3.0;
    } else if (creditRatio > 1) {
      baseRate += 1.0;
    }
    
    // Ajustar por prazo
    if (formData.termDays === 60) {
      baseRate += 1.0;
    } else if (formData.termDays === 90) {
      baseRate += 2.0;
    }
    
    // Bonificar receitas altas
    if (revenue >= 50000) {
      baseRate -= 1.0;
    }
    
    return Math.min(Math.max(baseRate, 5.0), 20.0);
  };

  const estimatedRate = calculateEstimatedInterest();
  const estimatedInterest = (parseFloat(formData.requestedAmount) || 0) * (estimatedRate / 100) * (formData.termDays / 365);
  const totalPayment = (parseFloat(formData.requestedAmount) || 0) + estimatedInterest;

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Conecte sua Carteira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Para solicitar crédito ChainFlow, você precisa conectar sua carteira Web3.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Status da Conexão */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isInitialized ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                {isInitialized ? 'Serviço Ativo' : 'Inicializando...'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Saldo USDC: {parseFloat(usdcBalance).toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Solicitação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#c1e428]" />
            Solicitação de Crédito ChainFlow
          </CardTitle>
          <p className="text-sm text-gray-600">
            Preencha os dados para análise automática de crédito na blockchain
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados da Empresa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Nome da Empresa *
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Ex: Tech Solutions Ltda"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
            </div>

            {/* Dados Financeiros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="monthlyRevenue" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Receita Mensal (USDC) *
                </Label>
                <Input
                  id="monthlyRevenue"
                  type="number"
                  value={formData.monthlyRevenue}
                  onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                  placeholder="5000"
                  min="5000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo: 5.000 USDC</p>
              </div>

              <div>
                <Label htmlFor="requestedAmount">Valor Solicitado (USDC) *</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  value={formData.requestedAmount}
                  onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                  placeholder="10000"
                  min="1000"
                  max="100000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">1.000 - 100.000 USDC</p>
              </div>

              <div>
                <Label htmlFor="termDays" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Prazo de Pagamento *
                </Label>
                <Select 
                  value={formData.termDays.toString()} 
                  onValueChange={(value) => handleInputChange('termDays', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição do Uso do Crédito</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva como o crédito será utilizado..."
                rows={3}
              />
            </div>

            {/* Estimativa de Juros */}
            {formData.requestedAmount && formData.monthlyRevenue && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-blue-800 mb-2">Estimativa de Análise:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Taxa Estimada:</span>
                      <div className="font-medium">{estimatedRate.toFixed(2)}%</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Juros Estimados:</span>
                      <div className="font-medium">{estimatedInterest.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} USDC</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Total a Pagar:</span>
                      <div className="font-medium">{totalPayment.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} USDC</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Ratio Crédito/Receita:</span>
                      <div className="font-medium">
                        {((parseFloat(formData.requestedAmount) / parseFloat(formData.monthlyRevenue)) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Erro */}
            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Erro:</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Botão de Envio */}
            <Button
              type="submit"
              disabled={submitting || loading || !isInitialized}
              className="w-full bg-[#c1e428] hover:bg-[#a8c424] text-black font-medium"
            >
              {submitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando Transação...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Solicitar Crédito na Blockchain
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              * A análise de crédito é feita automaticamente por smart contract na Base Sepolia
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

