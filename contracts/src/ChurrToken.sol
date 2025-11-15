// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ChurrToken
/// @notice 단순한 ERC20 보상 토큰. owner(보통 VolatilityCats 컨트랙트)만 mint 가능.
contract ChurrToken is ERC20, Ownable {
    constructor() ERC20("Churr", "CHURR") Ownable(msg.sender) {}

    function mintTo(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
