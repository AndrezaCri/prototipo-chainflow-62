// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SeamlessFiIntegration
 * @dev Contrato para integração com SeamlessFi para pools de crédito B2B
 * @notice Este contrato gerencia pools de crédito, empréstimos e investimentos
 */
contract SeamlessFiIntegration is ReentrancyGuard, Ownable, Pausable {
    
    // Estruturas de dados
    struct CreditPool {
        uint256 id;
        string name;
        uint256 term; // em dias
        uint256 apy; // APY em basis points (100 = 1%)
        uint256 totalSupplied;
        uint256 availableCapacity;
        uint256 maxCapacity;
        uint256 minInvestment;
        RiskLevel riskLevel;
        bool active;
        uint256 createdAt;
    }
    
    struct Loan {
        uint256 id;
        address borrower;
        uint256 poolId;
        uint256 amount;
        uint256 interestRate;
        uint256 term;
        uint256 startDate;
        uint256 maturityDate;
        LoanStatus status;
        uint256 businessScore;
        string companyName;
        string cnpj;
    }
    
    struct Investment {
        uint256 id;
        address investor;
        uint256 poolId;
        uint256 amount;
        uint256 timestamp;
        uint256 expectedReturn;
        bool withdrawn;
    }
    
    // Enums
    enum RiskLevel { Low, Medium, High }
    enum LoanStatus { Pending, Active, Completed, Defaulted }
    
    // Variáveis de estado
    IERC20 public usdcToken;
    IERC20 public brzToken;
    
    uint256 public nextPoolId = 1;
    uint256 public nextLoanId = 1;
    uint256 public nextInvestmentId = 1;
    
    mapping(uint256 => CreditPool) public creditPools;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => Investment) public investments;
    mapping(address => uint256[]) public userInvestments;
    mapping(address => uint256[]) public userLoans;
    
    // Taxas e limites
    uint256 public platformFee = 500; // 5% em basis points
    uint256 public constant MAX_APY = 5000; // 50% máximo
    uint256 public constant MIN_BUSINESS_SCORE = 750; // Score mínimo 7.5
    
    // Eventos
    event PoolCreated(uint256 indexed poolId, string name, uint256 apy, uint256 maxCapacity);
    event InvestmentMade(uint256 indexed investmentId, address indexed investor, uint256 indexed poolId, uint256 amount);
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 indexed poolId, uint256 amount);
    event LoanApproved(uint256 indexed loanId, uint256 interestRate);
    event LoanRepaid(uint256 indexed loanId, uint256 amount);
    event InvestmentWithdrawn(uint256 indexed investmentId, uint256 amount);
    
    constructor(address _usdcToken, address _brzToken) {
        usdcToken = IERC20(_usdcToken);
        brzToken = IERC20(_brzToken);
        
        // Criar pools iniciais
        _createInitialPools();
    }
    
    /**
     * @dev Criar pools de crédito iniciais
     */
    function _createInitialPools() internal {
        createCreditPool("Credit Pool 30D", 30, 920, 400000 * 10**6, 1000 * 10**6, RiskLevel.Low);
        createCreditPool("Credit Pool 60D", 60, 1050, 600000 * 10**6, 1000 * 10**6, RiskLevel.Low);
        createCreditPool("Credit Pool 90D", 90, 870, 700000 * 10**6, 1000 * 10**6, RiskLevel.Medium);
    }
    
    /**
     * @dev Criar um novo pool de crédito
     */
    function createCreditPool(
        string memory _name,
        uint256 _term,
        uint256 _apy,
        uint256 _maxCapacity,
        uint256 _minInvestment,
        RiskLevel _riskLevel
    ) public onlyOwner {
        require(_apy <= MAX_APY, "APY too high");
        require(_term > 0, "Invalid term");
        require(_maxCapacity > 0, "Invalid capacity");
        
        creditPools[nextPoolId] = CreditPool({
            id: nextPoolId,
            name: _name,
            term: _term,
            apy: _apy,
            totalSupplied: 0,
            availableCapacity: _maxCapacity,
            maxCapacity: _maxCapacity,
            minInvestment: _minInvestment,
            riskLevel: _riskLevel,
            active: true,
            createdAt: block.timestamp
        });
        
        emit PoolCreated(nextPoolId, _name, _apy, _maxCapacity);
        nextPoolId++;
    }
    
    /**
     * @dev Investir em um pool de crédito
     */
    function investInPool(uint256 _poolId, uint256 _amount) external nonReentrant whenNotPaused {
        CreditPool storage pool = creditPools[_poolId];
        require(pool.active, "Pool not active");
        require(_amount >= pool.minInvestment, "Below minimum investment");
        require(_amount <= pool.availableCapacity, "Exceeds available capacity");
        
        // Transferir USDC do investidor
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Calcular retorno esperado
        uint256 expectedReturn = _amount + (_amount * pool.apy * pool.term) / (365 * 10000);
        
        // Criar investimento
        investments[nextInvestmentId] = Investment({
            id: nextInvestmentId,
            investor: msg.sender,
            poolId: _poolId,
            amount: _amount,
            timestamp: block.timestamp,
            expectedReturn: expectedReturn,
            withdrawn: false
        });
        
        // Atualizar pool
        pool.totalSupplied += _amount;
        pool.availableCapacity -= _amount;
        
        // Atualizar mapeamentos
        userInvestments[msg.sender].push(nextInvestmentId);
        
        emit InvestmentMade(nextInvestmentId, msg.sender, _poolId, _amount);
        nextInvestmentId++;
    }
    
    /**
     * @dev Solicitar empréstimo
     */
    function requestLoan(
        uint256 _poolId,
        uint256 _amount,
        uint256 _businessScore,
        string memory _companyName,
        string memory _cnpj
    ) external nonReentrant whenNotPaused {
        CreditPool storage pool = creditPools[_poolId];
        require(pool.active, "Pool not active");
        require(_amount <= pool.totalSupplied, "Insufficient pool liquidity");
        require(_businessScore >= MIN_BUSINESS_SCORE, "Business score too low");
        
        // Calcular taxa de juros baseada no score e risco do pool
        uint256 interestRate = _calculateInterestRate(_businessScore, pool.riskLevel, pool.apy);
        
        // Criar empréstimo
        loans[nextLoanId] = Loan({
            id: nextLoanId,
            borrower: msg.sender,
            poolId: _poolId,
            amount: _amount,
            interestRate: interestRate,
            term: pool.term,
            startDate: 0, // Será definido na aprovação
            maturityDate: 0, // Será definido na aprovação
            status: LoanStatus.Pending,
            businessScore: _businessScore,
            companyName: _companyName,
            cnpj: _cnpj
        });
        
        userLoans[msg.sender].push(nextLoanId);
        
        emit LoanRequested(nextLoanId, msg.sender, _poolId, _amount);
        nextLoanId++;
    }
    
    /**
     * @dev Aprovar empréstimo (apenas owner)
     */
    function approveLoan(uint256 _loanId) external onlyOwner {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Pending, "Loan not pending");
        
        CreditPool storage pool = creditPools[loan.poolId];
        require(loan.amount <= pool.totalSupplied, "Insufficient pool liquidity");
        
        // Atualizar status do empréstimo
        loan.status = LoanStatus.Active;
        loan.startDate = block.timestamp;
        loan.maturityDate = block.timestamp + (loan.term * 1 days);
        
        // Atualizar pool
        pool.totalSupplied -= loan.amount;
        
        // Transferir USDC para o mutuário
        require(usdcToken.transfer(loan.borrower, loan.amount), "Transfer failed");
        
        emit LoanApproved(_loanId, loan.interestRate);
    }
    
    /**
     * @dev Pagar empréstimo
     */
    function repayLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not loan borrower");
        require(loan.status == LoanStatus.Active, "Loan not active");
        
        // Calcular valor total a pagar
        uint256 totalAmount = loan.amount + (loan.amount * loan.interestRate * loan.term) / (365 * 10000);
        
        // Transferir pagamento
        require(usdcToken.transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");
        
        // Atualizar status
        loan.status = LoanStatus.Completed;
        
        // Retornar liquidez ao pool
        CreditPool storage pool = creditPools[loan.poolId];
        pool.totalSupplied += totalAmount;
        pool.availableCapacity += (totalAmount - loan.amount); // Adicionar juros à capacidade
        
        emit LoanRepaid(_loanId, totalAmount);
    }
    
    /**
     * @dev Sacar investimento (após maturidade)
     */
    function withdrawInvestment(uint256 _investmentId) external nonReentrant {
        Investment storage investment = investments[_investmentId];
        require(investment.investor == msg.sender, "Not investor");
        require(!investment.withdrawn, "Already withdrawn");
        
        CreditPool storage pool = creditPools[investment.poolId];
        uint256 maturityDate = investment.timestamp + (pool.term * 1 days);
        require(block.timestamp >= maturityDate, "Not matured yet");
        
        // Marcar como sacado
        investment.withdrawn = true;
        
        // Transferir retorno esperado
        require(usdcToken.transfer(msg.sender, investment.expectedReturn), "Transfer failed");
        
        emit InvestmentWithdrawn(_investmentId, investment.expectedReturn);
    }
    
    /**
     * @dev Calcular taxa de juros baseada no business score e risco
     */
    function _calculateInterestRate(
        uint256 _businessScore,
        RiskLevel _riskLevel,
        uint256 _baseApy
    ) internal pure returns (uint256) {
        uint256 riskAdjustment = 0;
        
        // Ajuste baseado no risco do pool
        if (_riskLevel == RiskLevel.Medium) {
            riskAdjustment += 100; // +1%
        } else if (_riskLevel == RiskLevel.High) {
            riskAdjustment += 200; // +2%
        }
        
        // Ajuste baseado no business score
        if (_businessScore < 850) {
            riskAdjustment += 200; // +2% para score baixo
        } else if (_businessScore < 900) {
            riskAdjustment += 100; // +1% para score médio
        }
        // Score alto (>=900) não tem ajuste adicional
        
        return _baseApy + riskAdjustment;
    }
    
    /**
     * @dev Obter informações do pool
     */
    function getPoolInfo(uint256 _poolId) external view returns (CreditPool memory) {
        return creditPools[_poolId];
    }
    
    /**
     * @dev Obter informações do empréstimo
     */
    function getLoanInfo(uint256 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }
    
    /**
     * @dev Obter investimentos do usuário
     */
    function getUserInvestments(address _user) external view returns (uint256[] memory) {
        return userInvestments[_user];
    }
    
    /**
     * @dev Obter empréstimos do usuário
     */
    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }
    
    /**
     * @dev Pausar contrato (apenas owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Despausar contrato (apenas owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Atualizar taxa da plataforma (apenas owner)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Máximo 10%
        platformFee = _newFee;
    }
    
    /**
     * @dev Sacar taxas da plataforma (apenas owner)
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(usdcToken.transfer(owner(), balance), "Transfer failed");
    }
}

