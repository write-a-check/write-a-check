// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.6;

import "./IERC20.sol";

struct Cheque {
	address coinType;
	uint96 amount;

	address drawer;
	uint64 deadline;

	uint passphraseOrHashtag;
}

abstract contract ChainChequeBase {
	mapping(address => uint) public encryptionPubkeys;

	event NewCheque(address indexed payee, uint indexed id, address indexed drawer,
			uint coinTypeAndAmount, uint startAndEndTime, uint passphraseOrHashtag, bytes memo);
	event RevokeCheque(address indexed payee, uint indexed id, address indexed drawer);
	event AcceptCheque(address indexed payee, uint indexed id, address indexed drawer);
	event RefuseCheque(address indexed payee, uint indexed id, address indexed drawer);
	event SetEncryptionPubkey(address indexed payee, address referee, uint key);
	event UnsetEncryptionPubkey(address indexed payee);

	// @dev The address of precompile smart contract for SEP101
	address constant SEP101Contract = address(bytes20(uint160(0x2712)));

	// @dev The address of precompile smart contract for SEP206
	address constant SEP206Contract = address(bytes20(uint160(0x2711)));

	// virtual methods implemented by sub-contract
	function getCheque(uint id) internal virtual returns (Cheque memory cheque);
	function hasCheque(uint id) internal virtual returns (bool);
	function saveCheque(uint id, Cheque memory cheque) virtual internal;
	function deleteCheque(uint id) virtual internal;
	function safeTransfer(address coinType, address receiver, uint value) virtual internal;

// =====================================================================================================

	function getChequeContent(uint id) external returns (address coinType,
								uint96 amount,
								address drawer,
								uint64 deadline,
								uint passphraseOrHashtag) {

		Cheque memory cheque = getCheque(id);
		coinType = cheque.coinType;
		amount = cheque.amount;
		drawer = cheque.drawer;
		deadline = cheque.deadline;
		passphraseOrHashtag = cheque.passphraseOrHashtag;
	}

	function setEncryptionPubkey(uint key, address referee) external {
		encryptionPubkeys[msg.sender] = key;
		emit SetEncryptionPubkey(msg.sender, referee, key);
	}

	function unsetEncryptionPubkey() external {
		encryptionPubkeys[msg.sender] = 0;
		emit UnsetEncryptionPubkey(msg.sender);
	}

	function writeCheques(address[] calldata payeeList,
			address coinType,
			uint96 amount,
			uint64 deadline,
			uint[] calldata passphraseHashList,
			bytes[] calldata memoList) external payable {
		require(payeeList.length == passphraseHashList.length &&
		        payeeList.length == memoList.length, "length-mismatch");
		require(deadline > block.timestamp, "invalid-deadline");
		uint realAmount = uint(amount);
		if(coinType == SEP206Contract) {
			require(msg.value == uint(amount)*payeeList.length, "value-mismatch");
		} else {
			require(msg.value == 0, "dont-send-bch");
			uint oldBalance = IERC20(coinType).balanceOf(address(this));
			IERC20(coinType).transferFrom(msg.sender, address(this), uint(amount*payeeList.length));
			uint newBalance = IERC20(coinType).balanceOf(address(this));
			realAmount = (newBalance - oldBalance) / payeeList.length;
		}
		for(uint i=0; i<payeeList.length; i++) {
			_writeCheque(payeeList[i], coinType, uint96(realAmount), deadline,
				     passphraseHashList[i], memoList[i]);
		}
	}

	function writeCheque(address payee,
			address coinType,
			uint96 amount,
			uint64 deadline,
			uint passphraseOrHashtag,
			bytes calldata memo) external payable {
		require(deadline > block.timestamp, "invalid-deadline");
		uint realAmount = uint(amount);
		if(coinType == SEP206Contract) {
			require(msg.value == uint(amount), "value-mismatch");
		} else {
			require(msg.value == 0, "dont-send-bch");
			uint oldBalance = IERC20(coinType).balanceOf(address(this));
			IERC20(coinType).transferFrom(msg.sender, address(this), uint(amount));
			uint newBalance = IERC20(coinType).balanceOf(address(this));
			realAmount = newBalance - oldBalance;
		}
		_writeCheque(payee, coinType, uint96(realAmount), deadline, passphraseOrHashtag, memo);
	}

	function _writeCheque(address payee, 
			address coinType,
			uint96 realAmount,
			uint64 deadline,
			uint passphraseOrHashtag,
			bytes calldata memo) internal {
		require(encryptionPubkeys[payee] != 0, "no-enc-pubkey");
		require(deadline < block.timestamp + 30 days, "deadline-must-in-one-month");
		uint senderAsU256 = uint(uint160(bytes20(msg.sender)));
		uint id = (uint(uint160(bytes20(payee)))<<96) | (block.number<<32) | (uint(uint24(senderAsU256))<<8);
		while(hasCheque(id)) { //to find an unused id
			id++;
		}
		Cheque memory cheque;
		cheque.drawer = msg.sender;
		cheque.deadline = deadline;
		cheque.coinType = coinType;
		cheque.passphraseOrHashtag = passphraseOrHashtag;
		cheque.amount = realAmount;
		saveCheque(id, cheque);
		uint coinTypeAndAmount = (uint(uint160(bytes20(coinType)))<<96) | uint(realAmount);
		uint startAndEndTime = (block.timestamp<<64) | uint(deadline);
		emit NewCheque(payee, id, msg.sender, coinTypeAndAmount, startAndEndTime, passphraseOrHashtag, memo);
	}

	function revokeCheques(uint[] calldata idList) external {
		for(uint i=0; i<idList.length; i++) {
			revokeCheque(idList[i]);
		}
	}

	function revokeCheque(uint id) public {
		Cheque memory cheque = getCheque(id);
		require(cheque.deadline != 0, "cheque-not-exists");
		require(cheque.deadline < block.timestamp, "still-before-deadline");
		deleteCheque(id);
		safeTransfer(cheque.coinType, cheque.drawer, uint(cheque.amount));
		emit RevokeCheque(address(uint160(id>>96)), id, cheque.drawer);
	}

	function acceptCheques(uint[] calldata idList, bytes calldata passphrase) external {
		for(uint i=0; i<idList.length; i++) {
			receiveCheque(idList[i], true, passphrase);
		}
	}

	function refuseCheques(uint[] calldata idList) external {
		bytes memory zeroLenBz = new bytes(0);
		for(uint i=0; i<idList.length; i++) {
			receiveCheque(idList[i], false, zeroLenBz);
		}
	}

	function acceptCheque(uint id, bytes calldata passphrase) external {
		receiveCheque(id, true, passphrase);
	}

	function refuseCheque(uint id) external {
		receiveCheque(id, false, new bytes(0));
	}

	function receiveCheque(uint id, bool accept, bytes memory passphrase) internal {
		require(uint(uint160(bytes20(msg.sender))) == (id>>96), "not-payee");
		Cheque memory cheque = getCheque(id);
		require(cheque.deadline != 0, "cheque-not-exists");
		require(block.timestamp <= cheque.deadline, "after-deadline");
		address receiver = msg.sender;
		if(accept) {
			//check passphrase if it is not a hashtag
			if((cheque.passphraseOrHashtag>>248) != 35) { // ascii of '#' is 35
				bytes32 hash = keccak256(passphrase);
				require((uint(hash)<<8) == (cheque.passphraseOrHashtag<<8), "wrong-passphrase");
			}
			emit AcceptCheque(msg.sender, id, cheque.drawer);
		} else {
			receiver = cheque.drawer;
			emit RefuseCheque(msg.sender, id, cheque.drawer);
		}
		deleteCheque(id);
		safeTransfer(cheque.coinType, receiver, uint(cheque.amount));
	}
}

contract ChainCheque is ChainChequeBase {
	mapping(uint => Cheque) chequeMap;

	function getCheque(uint id) internal view override returns (Cheque memory cheque) {
		cheque = chequeMap[id];
	}

	function hasCheque(uint id) internal view override returns (bool) {
		Cheque memory cheque = chequeMap[id];
		return cheque.deadline != 0;
	}

	function saveCheque(uint id, Cheque memory cheque) internal override {
		chequeMap[id] = cheque;
	}

	function deleteCheque(uint id) internal override {
		delete chequeMap[id];
	}

	function safeTransfer(address coinType, address receiver, uint value) internal override {
		if(coinType == SEP206Contract) {
			receiver.call{value: value, gas: 9000}("");
		} else {
			IERC20(coinType).transfer(receiver, value);
		}
	}
}

contract ChainChequeForSmartBCH is ChainChequeBase {
	function getCheque(uint id) internal override returns (Cheque memory cheque) {
		bytes memory idBz = abi.encode(id);
		(bool success, bytes memory data) = SEP101Contract.delegatecall(
			abi.encodeWithSignature("get(bytes)", idBz));

		require(success && (data.length == 32*2 || data.length == 32*5));
		if (data.length == 32*2) {
			cheque.deadline = 0;
			return cheque;
		}

		bytes memory vaultBz;
		assembly { vaultBz := add(data, 64) }

		(uint w0, uint w1, uint w2) = abi.decode(vaultBz, (uint, uint, uint));
		cheque.coinType = address(bytes20(uint160(w0>>96)));
		cheque.amount = uint96(w0);

		cheque.drawer = address(bytes20(uint160(w1>>64)));
		cheque.deadline = uint64(w1);

		cheque.passphraseOrHashtag = w2;
	}

	function hasCheque(uint id) internal override returns (bool) {
		bytes memory idBz = abi.encode(id);
		(bool success, bytes memory data) = SEP101Contract.delegatecall(
			abi.encodeWithSignature("get(bytes)", idBz));

		require(success && (data.length == 32*2 || data.length == 32*5));
		return data.length == 32*5;
	}

	function saveCheque(uint id, Cheque memory cheque) internal override {
		bytes memory idBz = abi.encode(id);
		(uint w0, uint w1) = (0, 0);
		w0 = uint(uint160(bytes20(cheque.coinType)));
		w0 = (w0<<96) | uint(cheque.amount);

		w1 = uint(uint160(bytes20(cheque.drawer)));
		w1 = (w1<<64) | uint(cheque.deadline);

		bytes memory vaultBz = abi.encode(w0, w1, cheque.passphraseOrHashtag);
		(bool success, bytes memory _notUsed) = SEP101Contract.delegatecall(
			abi.encodeWithSignature("set(bytes,bytes)", idBz, vaultBz));
		require(success, "SEP101_SET_FAIL");
	}

	function deleteCheque(uint id) internal override {
		bytes memory idBz = abi.encode(id);
		bytes memory vaultBz = new bytes(0); //writing zero-length bytes is for deletion
		(bool success, bytes memory _notUsed) = SEP101Contract.delegatecall(
			abi.encodeWithSignature("set(bytes,bytes)", idBz, vaultBz));
		require(success, "SEP101_DEL_FAIL");
	}

	function safeTransfer(address coinType, address receiver, uint value) override internal {
		(bool success, bytes memory _notUsed) = coinType.call(
			abi.encodeWithSignature("transfer(address,uint256)", receiver, value));
		require(success, "SEP206_TRANSFER_FAIL");
	}
}
