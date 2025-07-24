import React, { useState } from 'react';
import { Building2, Calculator, Clock, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import { useSeamlessFi } from '@/hooks/useSeamlessFi';

interface CreditRequestProps {
  onRequestSubmit?: (data: CreditRequestData) => void;
}

interface CreditRequestData {
  companyName: string;
  cnpj: string;
  requestedAmount: number;
  term: 30 | 60 | 90;
  purpose: string;
  monthlyRevenue: number;
  businessScore?: number;
  interestRate?: number;
}

export const CreditRequest: React.FC<CreditRequestProps> = ({ onRequestSubmit }) => {
  const { analyzeCreditRequest, requestLoan, isLoading, error, isConnected } = useSeamlessFi();
  
  const [formData, setFormData] = useState<CreditRequestData>({
    companyName: '',
    cnpj: '',
    requestedAmount: 0,
    term: 30,
    purpose: '',
    monthlyRevenue: 0,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    businessScore: number;
    interestRate: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    approved: boolean;
  } | null>(null);

  // Análise de crédito usando SeamlessFi
  const analyzeCredit = async () => {
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeCreditRequest(
        formData.requestedAmount,
        formData.monthlyRevenue,
        formData.term
      );
      
      setAnalysis(result);
    } catch (err) {
      console.error('Credit analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!analysis) {
      await analyzeCredit();
      return;
    }
    
    if (analysis.approved) {
      if (isConnected) {
        // Solicitar empréstimo via contrato inteligente
        const poolId = formData.term === 30 ? 1 : formData.term === 60 ? 2 : 3;
        
        const success = await requestLoan({
          poolId,
          amount: formData.requestedAmount,
          businessScore: analysis.businessScore,
          companyName: formData.companyName,
          cnpj: formData.cnpj,
        });
        
        if (success && onRequestSubmit) {
          onRequestSubmit({
            ...formData,
            businessScore: analysis.businessScore,
            interestRate: analysis.interestRate
          });
        }
      } else {
        alert('Conecte sua carteira para solicitar o crédito');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-[#c1e428]" />
          Solicitação de Crédito B2B
        </h2>
        <p className="text-gray-600">
          Obtenha crédito rápido e seguro para sua empresa através de nossa plataforma DeFi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados da Empresa */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c1e428] focus:border-transparent"
                placeholder="Ex: Restaurante do João Ltda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ
              </label>
              <input
                type="text"
                required
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c1e428] focus:border-transparent"
                placeholder="00.000.000/0001-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faturamento Mensal
              </label>
              <input
                type="number"
                required
                value={formData.monthlyRevenue}
                onChange={(e) => setFormData({...formData, monthlyRevenue: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c1e428] focus:border-transparent"
                placeholder="50000"
              />
            </div>
          </div>

          {/* Dados do Crédito */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados do Crédito
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Solicitado
              </label>
              <input
                type="number"
                required
                value={formData.requestedAmount}
                onChange={(e) => setFormData({...formData, requestedAmount: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c1e428] focus:border-transparent"
                placeholder="25000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prazo de Pagamento
              </label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({...formData, term: Number(e.target.value) as 30 | 60 | 90})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c1e428] focus:border-transparent"
              >
                <option value={30}>30 dias</option>
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finalidade do Crédito
              </label>
              <textarea
                required
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c1e428] focus:border-transparent"
                placeholder="Ex: Compra de insumos para produção, capital de giro..."
              />
            </div>
          </div>
        </div>

        {/* Análise de Crédito */}
        {analysis && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Análise de Crédito
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <TrendingUp className="h-8 w-8 text-[#c1e428] mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{analysis.businessScore}/10</div>
                <div className="text-sm text-gray-600">Business Score</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg">
                <Calculator className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{analysis.interestRate}%</div>
                <div className="text-sm text-gray-600">Taxa de Juros</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg">
                <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{formData.term} dias</div>
                <div className="text-sm text-gray-600">Prazo</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg">
                <Shield className={`h-8 w-8 mx-auto mb-2 ${
                  analysis.riskLevel === 'Low' ? 'text-green-500' : 
                  analysis.riskLevel === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <div className="text-2xl font-bold text-gray-900">{analysis.riskLevel}</div>
                <div className="text-sm text-gray-600">Nível de Risco</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Resumo do Empréstimo</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Valor Principal:</span>
                  <span className="font-semibold ml-2">{formatCurrency(formData.requestedAmount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Juros ({analysis.interestRate}%):</span>
                  <span className="font-semibold ml-2">
                    {formatCurrency(formData.requestedAmount * (analysis.interestRate / 100))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total a Pagar:</span>
                  <span className="font-semibold ml-2">
                    {formatCurrency(formData.requestedAmount * (1 + analysis.interestRate / 100))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Vencimento:</span>
                  <span className="font-semibold ml-2">
                    {new Date(Date.now() + formData.term * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {!analysis.approved && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-semibold text-red-800">Crédito Não Aprovado</div>
                  <div className="text-sm text-red-600">
                    Seu business score está abaixo do mínimo exigido. Tente melhorar seus dados financeiros.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4 pt-6">
          {!analysis ? (
            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex-1 bg-[#c1e428] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#a8c523] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Analisando Crédito...
                </>
              ) : (
                'Analisar Crédito'
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAnalysis(null)}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Nova Análise
              </button>
              {analysis.approved && (
                <button
                  type="submit"
                  className="flex-1 bg-[#c1e428] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#a8c523] transition-colors"
                >
                  Solicitar Crédito
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

