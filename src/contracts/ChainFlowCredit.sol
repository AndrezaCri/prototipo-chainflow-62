// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ChainFlowCredit
 * @dev Contrato principal para sistema de crédito ChainFlow na Base Sepolia
 * @notice Permite criação de aplicações de crédito, análise automática e pagamentos
 */
contract ChainFlowCredit is ReentrancyGuard, Ownable, Pausable {
    
    // Endereços dos tokens na Base Sepolia
    IERC20 public constant USDC = IERC20(0x036CbD53842c5426634e7929541eC2318f3dCF7e);
    IERC20 public constant BRZ = IERC20(0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2);
    
    // Estruturas de dados
    struct CreditApplication {
        uint256 id;
        address borrower;
        string companyName;
        string cnpj;
        uint256 monthlyRevenue;
        uint256 requestedAmount;
        uint256 termDays;
        string description;
        CreditStatus status;
        uint256 approvedAmount;
        uint256 interestRate; // Em basis points (100 = 1%)
        uint256 createdAt;
        uint256 dueDate;
        bool isPaid;
        uint8 businessScore; // 1-10
        RiskLevel riskLevel;
    }
    
    struct CreditPool {
        uint256 totalSupplied;
        uint256 totalBorrowed;
        uint256 availableLiquidity;
        uint256 utilizationRate; // Em basis points
        uint256 baseInterestRate; // Em basis points
        mapping(address => uint256) supplierBalances;
        address[] suppliers;
    }
    
    struct SupplierPayment {
        uint256 applicationId;
        address supplier;
        uint256 amount;
        uint256 timestamp;
        bool processed;
    }
    
    enum CreditStatus {
        Pending,
        Approved,
        Rejected,
        Active,
        Paid,
        Defaulted
    }
    
    enum RiskLevel {
        Low,
        Medium,
        High
    }
    
    // Variáveis de estado
    uint256 public nextApplicationId = 1;
    uint256 public nextPaymentId = 1;
    
    mapping(uint256 => CreditApplication) public creditApplications;
    mapping(address => uint256[]) public userApplications;
    mapping(uint256 => SupplierPayment) public supplierPayments;
    
    CreditPool public usdcPool;
    CreditPool public brzPool;
    
    // Parâmetros do sistema
    uint256 public constant MIN_CREDIT_AMOUNT = 1000 * 1e6; // 1000 USDC
    uint256 public constant MAX_CREDIT_AMOUNT = 100000 * 1e6; // 100k USDC
    uint256 public constant MIN_MONTHLY_REVENUE = 5000 * 1e6; // 5k USDC
    uint256 public constant BASE_INTEREST_RATE = 500; // 5% base
    uint256 public constant MAX_INTEREST_RATE = 2000; // 20% max
    uint256 public constant PLATFORM_FEE = 100; // 1%
    
    // Eventos
    event CreditApplicationCreated(
        uint256 indexed applicationId,
        address indexed borrower,
        uint256 requestedAmount,
        uint256 termDays
    );
    
    event CreditApproved(
        uint256 indexed applicationId,
        uint256 approvedAmount,
        uint256 interestRate,
        uint256 dueDate
    );
    
    event CreditRejected(
        uint256 indexed applicationId,
        string reason
    );
    
    event SupplierPaymentProcessed(
        uint256 indexed paymentId,
        uint256 indexed applicationId,
        address indexed supplier,
        uint256 amount
    );
    
    event CreditRepaid(
        uint256 indexed applicationId,
        address indexed borrower,
        uint256 amount
    );
    
    event LiquiditySupplied(
        address indexed supplier,
        address indexed token,
        uint256 amount
    );
    
    event LiquidityWithdrawn(
        address indexed supplier,
        address indexed token,
        uint256 amount
    );
    
    constructor() {
        // Inicializar pools
        usdcPool.baseInterestRate = BASE_INTEREST_RATE;
        brzPool.baseInterestRate = BASE_INTEREST_RATE;
    }
    
    /**
     * @dev Criar nova aplicação de crédito
     */
    function createCreditApplication(
        string memory _companyName,
        string memory _cnpj,
        uint256 _monthlyRevenue,
        uint256 _requestedAmount,
        uint256 _termDays,
        string memory _description
    ) external whenNotPaused returns (uint256) {
        require(_requestedAmount >= MIN_CREDIT_AMOUNT, "Amount too low");
        require(_requestedAmount <= MAX_CREDIT_AMOUNT, "Amount too high");
        require(_monthlyRevenue >= MIN_MONTHLY_REVENUE, "Revenue too low");
        require(_termDays == 30 || _termDays == 60 || _termDays == 90, "Invalid term");
        require(bytes(_companyName).length > 0, "Company name required");
        require(bytes(_cnpj).length > 0, "CNPJ required");
        
        uint256 applicationId = nextApplicationId++;
        
        CreditApplication storage app = creditApplications[applicationId];
        app.id = applicationId;
        app.borrower = msg.sender;
        app.companyName = _companyName;
        app.cnpj = _cnpj;
        app.monthlyRevenue = _monthlyRevenue;
        app.requestedAmount = _requestedAmount;
        app.termDays = _termDays;
        app.description = _description;
        app.status = CreditStatus.Pending;
        app.createdAt = block.timestamp;
        
        userApplications[msg.sender].push(applicationId);
        
        // Análise automática de crédito
        _analyzeCreditApplication(applicationId);
        
        emit CreditApplicationCreated(applicationId, msg.sender, _requestedAmount, _termDays);
        
        return applicationId;
    }
    
    /**
     * @dev Análise automática de crédito usando algoritmo on-chain
     */
    function _analyzeCreditApplication(uint256 _applicationId) internal {
        CreditApplication storage app = creditApplications[_applicationId];
        
        // Calcular business score (1-10)
        uint8 businessScore = _calculateBusinessScore(
            app.monthlyRevenue,
            app.requestedAmount,
            app.termDays
        );
        
        app.businessScore = businessScore;
        
        // Determinar nível de risco
        if (businessScore >= 8) {
            app.riskLevel = RiskLevel.Low;
        } else if (businessScore >= 5) {
            app.riskLevel = RiskLevel.Medium;
        } else {
            app.riskLevel = RiskLevel.High;
        }
        
        // Calcular taxa de juros baseada no risco
        uint256 interestRate = _calculateInterestRate(app.riskLevel, app.termDays);
        app.interestRate = interestRate;
        
        // Verificar se há liquidez suficiente
        bool hasLiquidity = usdcPool.availableLiquidity >= app.requestedAmount;
        
        // Aprovar ou rejeitar baseado no score e liquidez
        if (businessScore >= 5 && hasLiquidity) {
            app.status = CreditStatus.Approved;
            app.approvedAmount = app.requestedAmount;
            app.dueDate = block.timestamp + (app.termDays * 1 days);
            
            // Reservar liquidez
            usdcPool.availableLiquidity -= app.requestedAmount;
            usdcPool.totalBorrowed += app.requestedAmount;
            
            emit CreditApproved(_applicationId, app.approvedAmount, interestRate, app.dueDate);
        } else {
            app.status = CreditStatus.Rejected;
            string memory reason = businessScore < 5 ? "Low business score" : "Insufficient liquidity";
            emit CreditRejected(_applicationId, reason);
        }
    }
    
    /**
     * @dev Calcular business score baseado em métricas financeiras
     */
    function _calculateBusinessScore(
        uint256 _monthlyRevenue,
        uint256 _requestedAmount,
        uint256 _termDays
    ) internal pure returns (uint8) {
        // Ratio de crédito vs receita mensal
        uint256 creditRatio = (_requestedAmount * 100) / _monthlyRevenue;
        
        uint8 score = 10;
        
        // Penalizar ratios altos
        if (creditRatio > 300) { // > 3x receita mensal
            score -= 4;
        } else if (creditRatio > 200) { // > 2x receita mensal
            score -= 2;
        } else if (creditRatio > 100) { // > 1x receita mensal
            score -= 1;
        }
        
        // Penalizar prazos longos
        if (_termDays == 90) {
            score -= 1;
        }
        
        // Bonificar receitas altas
        if (_monthlyRevenue >= 50000 * 1e6) { // >= 50k USDC
            score += 1;
        }
        
        return score > 10 ? 10 : score;
    }
    
    /**
     * @dev Calcular taxa de juros baseada no risco e prazo
     */
    function _calculateInterestRate(RiskLevel _riskLevel, uint256 _termDays) internal pure returns (uint256) {
        uint256 baseRate = BASE_INTEREST_RATE;
        
        // Ajustar por nível de risco
        if (_riskLevel == RiskLevel.High) {
            baseRate += 800; // +8%
        } else if (_riskLevel == RiskLevel.Medium) {
            baseRate += 300; // +3%
        }
        
        // Ajustar por prazo
        if (_termDays == 60) {
            baseRate += 100; // +1%
        } else if (_termDays == 90) {
            baseRate += 200; // +2%
        }
        
        return baseRate > MAX_INTEREST_RATE ? MAX_INTEREST_RATE : baseRate;
    }
    
    /**
     * @dev Processar pagamento ao fornecedor (chamado após aprovação)
     */
    function processSupplierPayment(
        uint256 _applicationId,
        address _supplier,
        uint256 _amount
    ) external whenNotPaused returns (uint256) {
        CreditApplication storage app = creditApplications[_applicationId];
        require(app.status == CreditStatus.Approved, "Application not approved");
        require(app.borrower == msg.sender, "Not borrower");
        require(_amount <= app.approvedAmount, "Amount exceeds approved");
        
        uint256 paymentId = nextPaymentId++;
        
        SupplierPayment storage payment = supplierPayments[paymentId];
        payment.applicationId = _applicationId;
        payment.supplier = _supplier;
        payment.amount = _amount;
        payment.timestamp = block.timestamp;
        payment.processed = false;
        
        // Transferir USDC para o fornecedor
        require(USDC.transfer(_supplier, _amount), "Transfer failed");
        
        payment.processed = true;
        app.status = CreditStatus.Active;
        
        emit SupplierPaymentProcessed(paymentId, _applicationId, _supplier, _amount);
        
        return paymentId;
    }
    
    /**
     * @dev Pagar crédito (com juros)
     */
    function repayCredit(uint256 _applicationId) external whenNotPaused nonReentrant {
        CreditApplication storage app = creditApplications[_applicationId];
        require(app.status == CreditStatus.Active, "Credit not active");
        require(app.borrower == msg.sender, "Not borrower");
        require(!app.isPaid, "Already paid");
        
        // Calcular valor total com juros
        uint256 principal = app.approvedAmount;
        uint256 interest = (principal * app.interestRate * app.termDays) / (10000 * 365);
        uint256 totalAmount = principal + interest;
        
        // Transferir tokens do borrower
        require(USDC.transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");
        
        // Atualizar estado
        app.isPaid = true;
        app.status = CreditStatus.Paid;
        
        // Retornar liquidez ao pool
        usdcPool.availableLiquidity += principal;
        usdcPool.totalBorrowed -= principal;
        
        // Distribuir juros aos fornecedores de liquidez
        _distributeInterest(interest);
        
        emit CreditRepaid(_applicationId, msg.sender, totalAmount);
    }
    
    /**
     * @dev Fornecer liquidez ao pool USDC
     */
    function supplyLiquidity(uint256 _amount) external whenNotPaused nonReentrant {
        require(_amount > 0, "Amount must be positive");
        
        // Transferir USDC do fornecedor
        require(USDC.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Atualizar pool
        if (usdcPool.supplierBalances[msg.sender] == 0) {
            usdcPool.suppliers.push(msg.sender);
        }
        
        usdcPool.supplierBalances[msg.sender] += _amount;
        usdcPool.totalSupplied += _amount;
        usdcPool.availableLiquidity += _amount;
        
        emit LiquiditySupplied(msg.sender, address(USDC), _amount);
    }
    
    /**
     * @dev Retirar liquidez do pool USDC
     */
    function withdrawLiquidity(uint256 _amount) external whenNotPaused nonReentrant {
        require(_amount > 0, "Amount must be positive");
        require(usdcPool.supplierBalances[msg.sender] >= _amount, "Insufficient balance");
        require(usdcPool.availableLiquidity >= _amount, "Insufficient liquidity");
        
        // Atualizar pool
        usdcPool.supplierBalances[msg.sender] -= _amount;
        usdcPool.totalSupplied -= _amount;
        usdcPool.availableLiquidity -= _amount;
        
        // Transferir USDC de volta
        require(USDC.transfer(msg.sender, _amount), "Transfer failed");
        
        emit LiquidityWithdrawn(msg.sender, address(USDC), _amount);
    }
    
    /**
     * @dev Distribuir juros aos fornecedores de liquidez
     */
    function _distributeInterest(uint256 _totalInterest) internal {
        if (usdcPool.totalSupplied == 0) return;
        
        uint256 platformFee = (_totalInterest * PLATFORM_FEE) / 10000;
        uint256 supplierReward = _totalInterest - platformFee;
        
        // Distribuir proporcionalmente aos fornecedores
        for (uint256 i = 0; i < usdcPool.suppliers.length; i++) {
            address supplier = usdcPool.suppliers[i];
            uint256 supplierBalance = usdcPool.supplierBalances[supplier];
            
            if (supplierBalance > 0) {
                uint256 reward = (supplierReward * supplierBalance) / usdcPool.totalSupplied;
                usdcPool.supplierBalances[supplier] += reward;
            }
        }
    }
    
    // Funções de visualização
    function getCreditApplication(uint256 _applicationId) external view returns (CreditApplication memory) {
        return creditApplications[_applicationId];
    }
    
    function getUserApplications(address _user) external view returns (uint256[] memory) {
        return userApplications[_user];
    }
    
    function getPoolInfo() external view returns (
        uint256 totalSupplied,
        uint256 totalBorrowed,
        uint256 availableLiquidity,
        uint256 utilizationRate
    ) {
        totalSupplied = usdcPool.totalSupplied;
        totalBorrowed = usdcPool.totalBorrowed;
        availableLiquidity = usdcPool.availableLiquidity;
        utilizationRate = totalSupplied > 0 ? (totalBorrowed * 10000) / totalSupplied : 0;
    }
    
    function getSupplierBalance(address _supplier) external view returns (uint256) {
        return usdcPool.supplierBalances[_supplier];
    }
    
    // Funções administrativas
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

