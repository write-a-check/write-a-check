// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.6;

import "./IERC20.sol";

struct Cheque {
	address coinType;
	uint96 amount;

	address drawer;
	uint64 deadline;

	uint passphraseHash;
}

contract ChainCheque {
	mapping(uint => Cheque) chequeMap;
	mapping(address => uint) public encryptionPubkeys;

	event NewCheque(address indexed payee, uint indexed id, address indexed drawer,
			uint coinTypeAndAmount, uint startAndEndTime, uint passphraseHash, bytes memo);
	event RevokeCheque(address indexed payee, uint indexed id);
	event AcceptCheque(address indexed payee, uint indexed id);
	event RefuseCheque(address indexed payee, uint indexed id);
	event SetEncryptionPubkey(address indexed payee, uint key);
	event UnsetEncryptionPubkey(address indexed payee);

	address constant SEP206Contract = address(bytes20(uint160(0x2711)));

	function getCheque(uint id) private view returns (Cheque memory cheque) {
		cheque = chequeMap[id];
	}

	function hasCheque(uint id) private view returns (bool) {
		Cheque memory cheque = chequeMap[id];
		return cheque.deadline != 0;
	}

	function saveCheque(uint id, Cheque memory cheque) internal {
		chequeMap[id] = cheque;
	}

	function deleteCheque(uint id) internal {
		delete chequeMap[id];
	}

	function safeTransfer(address coinType, address receiver, uint value) private {
		if(coinType == SEP206Contract) {
			receiver.call{value: value, gas: 9000}("");
		} else {
			IERC20(coinType).transfer(receiver, value);
		}
	}

// =====================================================================================================

	function getChequeContent(uint id) external view returns (
								address coinType,
								uint96 amount,
								address drawer,
								uint64 deadline,
								uint passphraseHash) {

		Cheque memory cheque = getCheque(id);
		coinType = cheque.coinType;
		amount = cheque.amount;
		drawer = cheque.drawer;
		deadline = cheque.deadline;
		passphraseHash = cheque.passphraseHash;
	}

	function setEncryptionPubkey(uint key) external {
		encryptionPubkeys[msg.sender] = key;
		emit SetEncryptionPubkey(msg.sender, key);
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
			uint passphraseHash,
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
		_writeCheque(payee, coinType, uint96(realAmount), deadline, passphraseHash, memo);
	}

	function _writeCheque(address payee, 
			address coinType,
			uint96 realAmount,
			uint64 deadline,
			uint passphraseHash,
			bytes calldata memo) internal {
		require(encryptionPubkeys[payee] != 0, "no-enc-pubkey");
		uint senderAsU256 = uint(uint160(bytes20(msg.sender)));
		uint id = uint(uint160(bytes20(payee))) | (block.number<<32) | (uint(uint24(senderAsU256))<<8);
		while(hasCheque(id)) { //to find an unused id
			id++;
		}
		Cheque memory cheque;
		cheque.drawer = msg.sender;
		cheque.deadline = deadline;
		cheque.coinType = coinType;
		cheque.passphraseHash = passphraseHash;
		cheque.amount = realAmount;
		saveCheque(id, cheque);
		uint coinTypeAndAmount = (uint(uint160(bytes20(coinType)))<<96) | uint(realAmount);
		uint startAndEndTime = (block.timestamp<<64) | uint(deadline);
		emit NewCheque(payee, id, msg.sender, coinTypeAndAmount, startAndEndTime, passphraseHash, memo);
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
		emit RevokeCheque(address(uint160(id>>96)), id);
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
			if(uint8(cheque.passphraseHash) != 35) { // ascii of '#' is 35
				bytes32 hash = keccak256(passphrase);
				require((uint(hash)>>8) == (cheque.passphraseHash>>8), "wrong-passphrase");
			}
			emit AcceptCheque(msg.sender, id);
		} else {
			receiver = cheque.drawer;
			emit RefuseCheque(msg.sender, id);
		}
		deleteCheque(id);
		safeTransfer(cheque.coinType, receiver, uint(cheque.amount));
	}
}

