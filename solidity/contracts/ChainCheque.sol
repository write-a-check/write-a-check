// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./IERC20.sol";

struct Cheque {
	address coinType;
	uint96 amount;

	address drawer;
	uint64 deadline;

	bytes32 passphraseHash;
}

contract ChainCheque {
	mapping(address => mapping(uint => Cheque)) chequeMap;
	mapping(address => uint) encryptionPubkeys;

	event NewCheque(address indexed payee, uint indexed id, uint coinTypeAndAmount,
			uint drawerAndDeadline, bytes32 passphraseHash, bytes memo);
	event RemoveCheque(address indexed payee, uint indexed id, bool accepted);
	event SetEncryptionPubkey(address indexed payee, uint key);
	event UnsetEncryptionPubkey(address indexed payee);

	address constant SEP206Contract = address(bytes20(uint160(0x2711)));

	function getCheque(address payee, uint id) private view returns (Cheque memory cheque) {
		cheque = chequeMap[payee][id];
	}

	function saveCheque(address payee, uint id, Cheque memory cheque) internal {
		chequeMap[payee][id] = cheque;
	}

	function deleteCheque(address payee, uint id) internal {
		delete chequeMap[payee][id];
	}

	function safeTransfer(address coinType, address receiver, uint value) private {
		if(coinType == SEP206Contract) {
			receiver.call{value: value, gas: 9000}("");
		} else {
			IERC20(coinType).transfer(receiver, value);
		}
	}

// =====================================================================================================

	function getChequeContent(address payee, uint id) external view returns (
								address coinType,
								uint96 amount,
								address drawer,
								uint64 deadline,
								bytes32 passphraseHash) {

		Cheque memory cheque = getCheque(payee, id);
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

	function writeCheque(address payee, 
			uint id, 
			address coinType,
			uint96 amount,
			uint64 deadline,
			bytes32 passphraseHash,
			bytes calldata memo) external payable {
		require(deadline > block.timestamp, "invalid-deadline");
		require(encryptionPubkeys[payee] != 0, "no-enc-pubkey");
		Cheque memory cheque = getCheque(payee, id);
		require(cheque.deadline == 0, "cheque-already-exists");
		cheque.drawer = msg.sender;
		cheque.deadline = deadline;
		cheque.coinType = coinType;
		cheque.passphraseHash = passphraseHash;
		uint realAmount = uint(amount);
		if(cheque.coinType == SEP206Contract) {
			require(msg.value == uint(amount), "value-mismatch");
		} else {
			require(msg.value == 0, "dont-send-bch");
			uint oldBalance = IERC20(cheque.coinType).balanceOf(address(this));
			IERC20(cheque.coinType).transferFrom(msg.sender, address(this), uint(amount));
			uint newBalance = IERC20(cheque.coinType).balanceOf(address(this));
			realAmount = newBalance - oldBalance;
		}
		cheque.amount = uint96(realAmount);
		saveCheque(payee, id, cheque);
		uint coinTypeAndAmount = (uint(uint160(bytes20(coinType)))<<96) | uint(amount);
		uint drawerAndDeadline = (uint(uint160(bytes20(msg.sender)))<<64) | uint(deadline);
		emit NewCheque(payee, id, coinTypeAndAmount, drawerAndDeadline, passphraseHash, memo);
	}

	function revokeCheque(address payee, uint id) external {
		Cheque memory cheque = getCheque(payee, id);
		require(cheque.deadline != 0, "cheque-not-exists");
		require(cheque.deadline < block.timestamp, "still-before-deadline");
		deleteCheque(payee, id);
		safeTransfer(cheque.coinType, cheque.drawer, uint(cheque.amount));
		emit RemoveCheque(payee, id, false);
	}

	function receiveCheque(uint id, bool accept, bytes calldata passphrase) external {
		Cheque memory cheque = getCheque(msg.sender, id);
		require(cheque.deadline != 0, "cheque-not-exists");
		require(block.timestamp <= cheque.deadline, "after-deadline");
		address receiver = msg.sender;
		if(accept) {
			if(cheque.passphraseHash != 0) {
				bytes32 hash = keccak256(passphrase);
				require(hash==cheque.passphraseHash, "wrong-passphrase");
			}
		} else {
			receiver = cheque.drawer;
		}
		deleteCheque(msg.sender, id);
		safeTransfer(cheque.coinType, receiver, uint(cheque.amount));
		emit RemoveCheque(msg.sender, id, accept);
	}
}

