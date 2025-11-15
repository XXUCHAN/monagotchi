// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IChurrToken {
    function owner() external view returns (address);
    function transferOwnership(address newOwner) external;
    function mintTo(address to, uint256 amount) external;
}
