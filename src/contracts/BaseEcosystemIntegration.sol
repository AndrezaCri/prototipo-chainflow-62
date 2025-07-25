// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title BaseEcosystemIntegration
 * @dev Contrato principal para integração ChainFlow com ecossistema Base
 * Integra SeamlessFi, Aerodrome, Cygnus e Spectral para crédito B2B
 */
contract BaseEcosystemIntegration is ReentrancyGuard, Ownable, Pausable {
    
    // Estruturas de dados
    struct CreditPool {
        uint256 id;
        string name;
        uint256 termDays;
        uint256 apy; // APY em basis points (100 = 1%)
        uint256 totalSupplied;
        uint256 availableCapacity;
        uint256 maxCapacity;
        uint256 minInvestment;
        uint8 riskLevel; // 1 = Low, 2 = Medium, 3 = High
        uint256 activeLoans;
        uint256 defaultRate; // Em basis points
        bool active;
    }
    
    struct CreditApplication {
        uint256 id;
        address borrower;
        string companyName;
        string cnpj;
        uint256 monthlyRevenue;
        uint256 requestedAmount;
        uint256 approvedAmount;
        uint256 termDays;
        uint256 interestRate; // Em basis points
        uint256 businessScore; // 0-1000 (1000 = 10.0)
        uint8 status; // 0=pending, 1=approved, 2=rejected, 3=active, 4=completed, 5=defaulted
        uint256 createdAt;
        uint256 approvedAt;
        uint256 dueDate;
        string purpose;
    }
    
    struct InvestorPosition {
        uint256 id;
        address investor;
        uint256 poolId;
        uint256 amount;
        uint256 expectedReturn;
        uint256 investedAt;
        uint256 maturityDate;
        bool withdrawn;
    }
    
    struct SupplierPayment {
        uint256 id;
        uint256 applicationId;
        address supplier;
        uint256 amount;
        string pixCode;
        uint8 status; // 0=pending, 1=paid, 2=failed
        uint256 createdAt;
        uint256 paidAt;
    }
    
    // Tokens do ecossistema Base
    IERC20 public immutable USDC;
    IERC20 public immutable BRZ;
    
    // Endereços dos protocolos Base
    address public seamlessFiLending;
    address public aerodromeRouter;
    address public cygnusStablecoin;
    address public spectralGovernance;
    
    // Contadores e mapeamentos
    uint256 public nextPoolId = 1;
    uint256 public nextApplicationId = 1;
    uint256 public nextPositionId = 1;
    uint256 public nextPaymentId = 1;
    
    mapping(uint256 => CreditPool) public creditPools;
    mapping(uint256 => CreditApplication) public creditApplications;
    mapping(uint256 => InvestorPosition) public investorPositions;
    mapping(uint256 => SupplierPayment) public supplierPayments;
    
    // Mapeamentos por endereço
    mapping(address => uint256[]) public borrowerApplications;
    mapping(address => uint256[]) public investorPositions_byAddress;
    mapping(address => uint256) public totalInvested;
    mapping(address => uint256) public totalBorrowed;
    
    // Configurações do sistema
    uint256 public platformFeeRate = 500; // 5% em basis points
    uint256 public minBusinessScore = 750; // 7.5 em escala 0-1000
    uint256 public maxLoanToRevenueRatio = 5000; // 50% em basis points
    
    // Eventos
    event CreditPoolCreated(uint256 indexed poolId, string name, uint256 termDays, uint256 apy);
    event CreditApplicationSubmitted(uint256 indexed applicationId, address indexed borrower, uint256 amount);
    event CreditApplicationApproved(uint256 indexed applicationId, uint256 approvedAmount, uint256 interestRate);
    event CreditApplicationRejected(uint256 indexed applicationId, string reason);
    event InvestmentMade(uint256 indexed positionId, address indexed investor, uint256 poolId, uint256 amount);
    event SupplierPaymentProcessed(uint256 indexed paymentId, uint256 applicationId, uint256 amount);
    event LoanRepaid(uint256 indexed applicationId, uint256 amount);
    event LoanDefaulted(uint256 indexed applicationId, uint256 amount);
    
    constructor(
        address _usdc,
        address _brz,
        address _seamlessFi,
        address _aerodrome,
        address _cygnus,
        address _spectral
    ) {
        USDC = IERC20(_usdc);
        BRZ = IERC20(_brz);
        seamlessFiLending = _seamlessFi;
        aerodromeRouter = _aerodrome;
        cygnusStablecoin = _cygnus;
        spectralGovernance = _spectral;
        
        // Criar pools iniciais
        _createInitialPools();
    }
    
    /**
     * @dev Criar pools de crédito iniciais
     */
    function _createInitialPools() internal {
        // Pool 30 dias
        creditPools[nextPoolId] = CreditPool({
            id: nextPoolId,
            name: "Credit Pool 30D",
            termDays: 30,
            apy: 920, // 9.2%
            totalSupplied: 0,
            availableCapacity: 400000 * 10**6, // 400k USDC
            maxCapacity: 400000 * 10**6,
            minInvestment: 1000 * 10**6, // 1k USDC
            riskLevel: 1, // Low
            activeLoans: 0,
            defaultRate: 80, // 0.8%
            active: true
        });
        emit CreditPoolCreated(nextPoolId, "Credit Pool 30D", 30, 920);
        nextPoolId++;
        
        // Pool 60 dias
        creditPools[nextPoolId] = CreditPool({
            id: nextPoolId,
            name: "Credit Pool 60D",
            termDays: 60,
            apy: 1050, // 10.5%
            totalSupplied: 0,
            availableCapacity: 600000 * 10**6, // 600k USDC
            maxCapacity: 600000 * 10**6,
            minInvestment: 1000 * 10**6,
            riskLevel: 1, // Low
            activeLoans: 0,
            defaultRate: 120, // 1.2%
            active: true
        });
        emit CreditPoolCreated(nextPoolId, "Credit Pool 60D", 60, 1050);
        nextPoolId++;
        
        // Pool 90 dias
        creditPools[nextPoolId] = CreditPool({
            id: nextPoolId,
            name: "Credit Pool 90D",
            termDays: 90,
            apy: 870, // 8.7%
            totalSupplied: 0,
            availableCapacity: 700000 * 10**6, // 700k USDC
            maxCapacity: 700000 * 10**6,
            minInvestment: 1000 * 10**6,
            riskLevel: 2, // Medium
            activeLoans: 0,
            defaultRate: 210, // 2.1%
            active: true
        });
        emit CreditPoolCreated(nextPoolId, "Credit Pool 90D", 90, 870);
        nextPoolId++;
    }
    
    /**
     * @dev Submeter aplicação de crédito
     */
    function submitCreditApplication(
        string memory _companyName,
        string memory _cnpj,
        uint256 _monthlyRevenue,
        uint256 _requestedAmount,
        uint256 _termDays,
        string memory _purpose
    ) external whenNotPaused returns (uint256) {
        require(_requestedAmount > 0, "Amount must be greater than 0");
        require(_monthlyRevenue > 0, "Revenue must be greater than 0");
        require(_termDays == 30 || _termDays == 60 || _termDays == 90, "Invalid term");
        
        // Verificar ratio empréstimo/receita
        uint256 loanToRevenueRatio = (_requestedAmount * 10000) / _monthlyRevenue;
        require(loanToRevenueRatio <= maxLoanToRevenueRatio, "Loan to revenue ratio too high");
        
        uint256 applicationId = nextApplicationId;
        
        creditApplications[applicationId] = CreditApplication({
            id: applicationId,
            borrower: msg.sender,
            companyName: _companyName,
            cnpj: _cnpj,
            monthlyRevenue: _monthlyRevenue,
            requestedAmount: _requestedAmount,
            approvedAmount: 0,
            termDays: _termDays,
            interestRate: 0,
            businessScore: 0,
            status: 0, // pending
            createdAt: block.timestamp,
            approvedAt: 0,
            dueDate: 0,
            purpose: _purpose
        });
        
        borrowerApplications[msg.sender].push(applicationId);
        
        emit CreditApplicationSubmitted(applicationId, msg.sender, _requestedAmount);
        
        nextApplicationId++;
        return applicationId;
    }
    
    /**
     * @dev Analisar e aprovar/rejeitar aplicação de crédito (apenas owner)
     */
    function processCreditApplication(
        uint256 _applicationId,
        bool _approved,
        uint256 _approvedAmount,
        uint256 _interestRate,
        uint256 _businessScore,
        string memory _rejectionReason
    ) external onlyOwner {
        CreditApplication storage app = creditApplications[_applicationId];
        require(app.id != 0, "Application not found");
        require(app.status == 0, "Application already processed");
        
        if (_approved) {
            require(_approvedAmount > 0 && _approvedAmount <= app.requestedAmount, "Invalid approved amount");
            require(_businessScore >= minBusinessScore, "Business score too low");
            
            // Verificar liquidez disponível no pool
            uint256 poolId = _getPoolIdByTerm(app.termDays);
            require(creditPools[poolId].availableCapacity >= _approvedAmount, "Insufficient pool liquidity");
            
            app.status = 1; // approved
            app.approvedAmount = _approvedAmount;
            app.interestRate = _interestRate;
            app.businessScore = _businessScore;
            app.approvedAt = block.timestamp;
            app.dueDate = block.timestamp + (app.termDays * 1 days);
            
            // Reduzir capacidade disponível no pool
            creditPools[poolId].availableCapacity -= _approvedAmount;
            creditPools[poolId].activeLoans++;
            
            emit CreditApplicationApproved(_applicationId, _approvedAmount, _interestRate);
        } else {
            app.status = 2; // rejected
            emit CreditApplicationRejected(_applicationId, _rejectionReason);
        }
    }
    
    /**
     * @dev Investir em pool de crédito
     */
    function investInCreditPool(
        uint256 _poolId,
        uint256 _amount
    ) external nonReentrant whenNotPaused returns (uint256) {
        CreditPool storage pool = creditPools[_poolId];
        require(pool.active, "Pool not active");
        require(_amount >= pool.minInvestment, "Amount below minimum investment");
        require(_amount <= pool.availableCapacity, "Amount exceeds available capacity");
        
        // Transferir USDC do investidor
        require(USDC.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");
        
        // Calcular retorno esperado
        uint256 expectedReturn = _amount + ((_amount * pool.apy * pool.termDays) / (365 * 10000));
        uint256 maturityDate = block.timestamp + (pool.termDays * 1 days);
        
        uint256 positionId = nextPositionId;
        
        investorPositions[positionId] = InvestorPosition({
            id: positionId,
            investor: msg.sender,
            poolId: _poolId,
            amount: _amount,
            expectedReturn: expectedReturn,
            investedAt: block.timestamp,
            maturityDate: maturityDate,
            withdrawn: false
        });
        
        investorPositions_byAddress[msg.sender].push(positionId);
        totalInvested[msg.sender] += _amount;
        
        // Atualizar pool
        pool.totalSupplied += _amount;
        pool.availableCapacity += _amount; // Aumenta liquidez disponível
        
        emit InvestmentMade(positionId, msg.sender, _poolId, _amount);
        
        nextPositionId++;
        return positionId;
    }
    
    /**
     * @dev Processar pagamento para fornecedor
     */
    function processSupplierPayment(
        uint256 _applicationId,
        address _supplier,
        uint256 _amount,
        string memory _pixCode
    ) external onlyOwner returns (uint256) {
        CreditApplication storage app = creditApplications[_applicationId];
        require(app.status == 1, "Application not approved");
        require(_amount <= app.approvedAmount, "Amount exceeds approved amount");
        
        uint256 paymentId = nextPaymentId;
        
        supplierPayments[paymentId] = SupplierPayment({
            id: paymentId,
            applicationId: _applicationId,
            supplier: _supplier,
            amount: _amount,
            pixCode: _pixCode,
            status: 0, // pending
            createdAt: block.timestamp,
            paidAt: 0
        });
        
        // Marcar aplicação como ativa
        app.status = 3; // active
        
        emit SupplierPaymentProcessed(paymentId, _applicationId, _amount);
        
        nextPaymentId++;
        return paymentId;
    }
    
    /**
     * @dev Processar pagamento do comprador (quitação do empréstimo)
     */
    function processBuyerPayment(
        uint256 _applicationId,
        uint256 _paidAmount
    ) external nonReentrant whenNotPaused {
        CreditApplication storage app = creditApplications[_applicationId];
        require(app.borrower == msg.sender, "Not the borrower");
        require(app.status == 3, "Loan not active");
        
        // Calcular valor total com juros
        uint256 principal = app.approvedAmount;
        uint256 interest = (principal * app.interestRate * app.termDays) / (365 * 10000);
        uint256 totalAmount = principal + interest;
        
        require(_paidAmount >= totalAmount, "Insufficient payment amount");
        
        // Transferir pagamento em USDC
        require(USDC.transferFrom(msg.sender, address(this), totalAmount), "Payment transfer failed");
        
        // Marcar como completado
        app.status = 4; // completed
        
        // Distribuir rendimentos para investidores
        _distributeReturnsToInvestors(app.termDays, interest);
        
        // Atualizar pool
        uint256 poolId = _getPoolIdByTerm(app.termDays);
        creditPools[poolId].activeLoans--;
        creditPools[poolId].availableCapacity += principal; // Retornar principal ao pool
        
        emit LoanRepaid(_applicationId, totalAmount);
    }
    
    /**
     * @dev Marcar empréstimo como inadimplente (apenas owner)
     */
    function markLoanAsDefaulted(uint256 _applicationId) external onlyOwner {
        CreditApplication storage app = creditApplications[_applicationId];
        require(app.status == 3, "Loan not active");
        require(block.timestamp > app.dueDate, "Loan not overdue yet");
        
        app.status = 5; // defaulted
        
        // Atualizar estatísticas do pool
        uint256 poolId = _getPoolIdByTerm(app.termDays);
        creditPools[poolId].activeLoans--;
        
        // Atualizar taxa de inadimplência
        uint256 totalLoans = creditPools[poolId].activeLoans + 1; // +1 para incluir o defaulted
        creditPools[poolId].defaultRate = (creditPools[poolId].defaultRate * (totalLoans - 1) + 10000) / totalLoans;
        
        emit LoanDefaulted(_applicationId, app.approvedAmount);
    }
    
    /**
     * @dev Sacar retornos do investimento
     */
    function withdrawInvestmentReturns(uint256 _positionId) external nonReentrant {
        InvestorPosition storage position = investorPositions[_positionId];
        require(position.investor == msg.sender, "Not the investor");
        require(!position.withdrawn, "Already withdrawn");
        require(block.timestamp >= position.maturityDate, "Not matured yet");
        
        position.withdrawn = true;
        
        // Transferir retorno esperado
        require(USDC.transfer(msg.sender, position.expectedReturn), "Transfer failed");
        
        totalInvested[msg.sender] -= position.amount;
    }
    
    /**
     * @dev Distribuir rendimentos para investidores de um pool específico
     */
    function _distributeReturnsToInvestors(uint256 _termDays, uint256 _totalInterest) internal {
        uint256 poolId = _getPoolIdByTerm(_termDays);
        
        // Encontrar investidores ativos do pool
        // Nota: Em produção, seria necessário um sistema mais eficiente para rastrear investidores por pool
        
        // Deduzir taxa da plataforma
        uint256 platformFee = (_totalInterest * platformFeeRate) / 10000;
        uint256 investorReturns = _totalInterest - platformFee;
        
        // Distribuir proporcionalmente aos investidores
        // Implementação simplificada - em produção seria mais complexa
    }
    
    /**
     * @dev Obter ID do pool por prazo
     */
    function _getPoolIdByTerm(uint256 _termDays) internal pure returns (uint256) {
        if (_termDays == 30) return 1;
        if (_termDays == 60) return 2;
        if (_termDays == 90) return 3;
        revert("Invalid term");
    }
    
    /**
     * @dev Integração com SeamlessFi para otimização de rendimentos
     */
    function optimizeYieldWithSeamlessFi(uint256 _amount) external onlyOwner {
        // Depositar USDC idle no SeamlessFi para gerar rendimento adicional
        require(USDC.approve(seamlessFiLending, _amount), "Approval failed");
        
        // Chamada para SeamlessFi (interface simplificada)
        // ISeamlessFi(seamlessFiLending).supply(address(USDC), _amount);
    }
    
    /**
     * @dev Integração com Aerodrome para liquidez BRZ/USDC
     */
    function provideLiquidityToAerodrome(uint256 _usdcAmount, uint256 _brzAmount) external onlyOwner {
        require(USDC.approve(aerodromeRouter, _usdcAmount), "USDC approval failed");
        require(BRZ.approve(aerodromeRouter, _brzAmount), "BRZ approval failed");
        
        // Adicionar liquidez ao pool BRZ/USDC no Aerodrome
        // IAerodromeRouter(aerodromeRouter).addLiquidity(...);
    }
    
    /**
     * @dev Integração com Cygnus para stablecoin com rendimento
     */
    function mintCygnusStablecoin(uint256 _amount) external onlyOwner {
        require(USDC.approve(cygnusStablecoin, _amount), "Approval failed");
        
        // Mint Cygnus stablecoin que gera rendimento automático
        // ICygnus(cygnusStablecoin).mint(_amount);
    }
    
    /**
     * @dev Integração com Spectral para governança valocrática
     */
    function submitGovernanceProposal(
        string memory _title,
        string memory _description,
        bytes memory _calldata
    ) external returns (uint256) {
        // Submeter proposta para governança Spectral
        // return ISpectral(spectralGovernance).submitProposal(_title, _description, _calldata);
        return 0; // Placeholder
    }
    
    // Funções de visualização
    function getCreditPool(uint256 _poolId) external view returns (CreditPool memory) {
        return creditPools[_poolId];
    }
    
    function getCreditApplication(uint256 _applicationId) external view returns (CreditApplication memory) {
        return creditApplications[_applicationId];
    }
    
    function getInvestorPosition(uint256 _positionId) external view returns (InvestorPosition memory) {
        return investorPositions[_positionId];
    }
    
    function getBorrowerApplications(address _borrower) external view returns (uint256[] memory) {
        return borrowerApplications[_borrower];
    }
    
    function getInvestorPositions(address _investor) external view returns (uint256[] memory) {
        return investorPositions_byAddress[_investor];
    }
    
    // Funções administrativas
    function updatePlatformFeeRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 1000, "Fee rate too high"); // Max 10%
        platformFeeRate = _newRate;
    }
    
    function updateMinBusinessScore(uint256 _newScore) external onlyOwner {
        require(_newScore <= 1000, "Score too high");
        minBusinessScore = _newScore;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}

