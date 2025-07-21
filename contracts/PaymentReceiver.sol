// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentReceiver is Ownable {
    event UsdcReceived(address indexed from, uint256 amount);
    event UsdcWithdrawn(address indexed to, uint256 amount);

    // Endereço do contrato USDC na rede Base Sepolia (exemplo, pode variar)
    // Este é o endereço do USDC na Base Sepolia para fins de teste.
    // Em produção, use o endereço oficial do USDC na rede Base Mainnet.
    IERC20 public usdcToken;

    constructor(address _usdcTokenAddress) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcTokenAddress);
    }

    // Função para receber USDC. O usuário deve primeiro aprovar este contrato
    // para gastar seus USDC usando a função `approve` do contrato USDC.
    function receiveUsdc(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");
        emit UsdcReceived(msg.sender, _amount);
    }

    // Função para o proprietário retirar os USDC recebidos
    function withdrawUsdc(uint256 _amount) public onlyOwner {
        require(_amount > 0, "Amount must be greater than zero");
        require(usdcToken.transfer(owner(), _amount), "USDC withdrawal failed");
        emit UsdcWithdrawn(owner(), _amount);
    }

    // Função para o proprietário retirar ETH acidentalmente enviado para o contrato
    function withdrawEther() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Ether withdrawal failed");
    }

    // Fallback function para receber ETH
    receive() external payable {}
    fallback() external payable {}
}


