import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface LoanData {
  id: string;
  companyName: string;
  amount: number;
  term: number;
  interestRate: number;
  status: 'Active' | 'Pending' | 'Completed' | 'Defaulted';
  startDate: string;
  maturityDate: string;
  businessScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface PoolMetrics {
  totalLoaned: number;
  totalRepaid: number;
  activeLoans: number;
  defaultRate: number;
  averageAPY: number;
  totalInvestors: number;
}

export const CreditDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'analytics'>('overview');

  const poolMetrics: PoolMetrics = {
    totalLoaned: 1250000,
    totalRepaid: 980000,
    activeLoans: 55,
    defaultRate: 1.4,
    averageAPY: 9.5,
    totalInvestors: 127
  };

  const recentLoans: LoanData[] = [
    {
      id: 'loan-001',
      companyName: 'Restaurante Sabor & Arte',
      amount: 25000,
      term: 30,
      interestRate: 9.2,
      status: 'Active',
      startDate: '2025-01-15',
      maturityDate: '2025-02-14',
      businessScore: 8.5,
      riskLevel: 'Low'
    },
    {
      id: 'loan-002',
      companyName: 'Padaria Central Ltda',
      amount: 18000,
      term: 60,
      interestRate: 10.5,
      status: 'Active',
      startDate: '2025-01-10',
      maturityDate: '2025-03-11',
      businessScore: 9.1,
      riskLevel: 'Low'
    },
    {
      id: 'loan-003',
      companyName: 'Distribuidora Norte',
      amount: 45000,
      term: 90,
      interestRate: 8.7,
      status: 'Pending',
      startDate: '2025-01-20',
      maturityDate: '2025-04-20',
      businessScore: 7.8,
      riskLevel: 'Medium'
    },
    {
      id: 'loan-004',
      companyName: 'Café da Esquina',
      amount: 12000,
      term: 30,
      interestRate: 9.2,
      status: 'Completed',
      startDate: '2024-12-15',
      maturityDate: '2025-01-14',
      businessScore: 8.9,
      riskLevel: 'Low'
    },
    {
      id: 'loan-005',
      companyName: 'Mercado São João',
      amount: 32000,
      term: 60,
      interestRate: 11.2,
      status: 'Defaulted',
      startDate: '2024-11-20',
      maturityDate: '2025-01-19',
      businessScore: 6.8,
      riskLevel: 'High'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUSDC = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + ' USDC';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-blue-600 bg-blue-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Defaulted': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Clock className="h-4 w-4" />;
      case 'Pending': return <AlertCircle className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Defaulted': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-[#c1e428]" />
          Credit Dashboard - SeamlessFi Analytics
        </h2>
        <p className="text-gray-600">
          Monitore o desempenho dos pools de crédito e analise métricas de risco em tempo real
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'loans', label: 'Active Loans', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#c1e428] text-[#c1e428]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Loaned</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatUSDC(poolMetrics.totalLoaned)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-[#c1e428]" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Repaid</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatUSDC(poolMetrics.totalRepaid)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Loans</p>
                  <p className="text-xl font-bold text-gray-900">{poolMetrics.activeLoans}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Default Rate</p>
                  <p className="text-xl font-bold text-gray-900">{poolMetrics.defaultRate}%</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average APY</p>
                  <p className="text-xl font-bold text-gray-900">{poolMetrics.averageAPY}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Investors</p>
                  <p className="text-xl font-bold text-gray-900">{poolMetrics.totalInvestors}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Gráfico de Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Loan Status Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                      </div>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Defaulted</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '2%' }}></div>
                      </div>
                      <span className="text-sm font-medium">2%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Risk Level Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Low Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <span className="text-sm font-medium">70%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Medium Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">High Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                      </div>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Loans</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maturity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{loan.companyName}</div>
                      <div className="text-sm text-gray-500">{loan.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatUSDC(loan.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{loan.term} days</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{loan.interestRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(loan.riskLevel)}`}>
                        {loan.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{loan.businessScore}/10</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(loan.maturityDate).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total ROI</span>
                  <span className="text-lg font-bold text-green-600">+12.4%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Monthly Growth</span>
                  <span className="text-lg font-bold text-blue-600">+8.2%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Recovery Rate</span>
                  <span className="text-lg font-bold text-purple-600">98.6%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Avg. Loan Duration</span>
                  <span className="text-lg font-bold text-orange-600">52 days</span>
                </div>
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Portfolio Risk Score</span>
                    <span className="text-sm font-bold text-green-600">7.8/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Diversification Index</span>
                    <span className="text-sm font-bold text-blue-600">8.5/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Liquidity Ratio</span>
                    <span className="text-sm font-bold text-purple-600">9.2/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">↗ 15%</div>
                <div className="text-sm text-gray-600">Loan Volume Growth</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">↘ 0.3%</div>
                <div className="text-sm text-gray-600">Default Rate Reduction</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">↗ 23%</div>
                <div className="text-sm text-gray-600">New Borrowers</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

