pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() public ERC20("test token", "test") {
        _mint(msg.sender, 1000000);
    }
}