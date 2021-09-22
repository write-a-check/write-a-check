// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

contract SimpleToken {
    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string public name;
    string public symbol;
    uint8 private immutable _decimals;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor (string memory name_, string memory symbol_, uint256 supply, uint8 decimals_) {
        name = name_;
        symbol = symbol_;
        _decimals = decimals_;
        _totalSupply = supply;
        _balances[msg.sender] = supply;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender] - subtractedValue);
        return true;
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public {
        uint256 decreasedAllowance = allowance(account, msg.sender) - amount;

        _approve(account, msg.sender, decreasedAllowance);
        _burn(account, amount);
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "TRANSFER_FROM_THE_ZERO_ADDRESS");
        require(recipient != address(0), "TRANSFER_TO_THE_ZERO_ADDRESS");

        _balances[sender] = _balances[sender] - amount;
        _balances[recipient] = _balances[recipient] + amount;
        emit Transfer(sender, recipient, amount);
    }

    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "BURN_FROM_THE_ZERO_ADDRESS");
        _balances[account] = _balances[account] - amount;
        _totalSupply = _totalSupply - amount;
        emit Transfer(account, address(0), amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "APPROVE_FROM_THE_ZERO_ADDRESS");
        require(spender != address(0), "APPROVE_TO_THE_ZERO_ADDRESS");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}

