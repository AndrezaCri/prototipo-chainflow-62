// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentReceiver is Ownable {
    event UsdcReceived(address indexed from, uint256 amount);
    event UsdcWithdrawn(address indexed to, uint256 amount);

    IERC20 public usdcToken;

    constructor(address _usdcTokenAddress) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcTokenAddress);
    }

    function receiveUsdc(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");
        emit UsdcReceived(msg.sender, _amount);
    }

    function withdrawUsdc(uint256 _amount) public onlyOwner {
        require(_amount > 0, "Amount must be greater than zero");
        require(usdcToken.transfer(owner(), _amount), "USDC withdrawal failed");
        emit UsdcWithdrawn(owner(), _amount);
    }

    function withdrawEther() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Ether withdrawal failed");
    }

    receive() external payable {}
    fallback() external payable {}
}