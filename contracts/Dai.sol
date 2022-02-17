//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Dai is ERC20 {
    constructor() ERC20('DAI', 'DAI') {
        console.log(msg.sender);
    }

    function faucet(address to, uint amount) external {
        _mint(to, amount);
    }
}