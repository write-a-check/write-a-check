const { ethers } = require("ethers");
const fs = require("fs");

function uint8ArrayToHex(buffer) {
  return Array.prototype.map.call(buffer, x => x.toString(16).padStart(2, '0')).join('');
}

function strToBytes32Hex(s) {
  const encoder = new TextEncoder()
  const encData = encoder.encode(s)
  const hex = uint8ArrayToHex(encData)
  return "0x"+hex+("0".repeat(Math.max(0, 64-hex.length)))
}

async function writeCheques(payeeList, chequeContract, gasPrice, from) {
	const coinType = "0x265bD28d79400D55a1665707Fa14A72978FA6043"
	const sendAmt = ethers.utils.parseUnits("0.01", 2)
	const deadline = Date.now() + 14*24*3600*1000
	const deadlineTimestamp = Math.floor(deadline / 1000)
	var passphraseHashList = []
	var memoEncList = []
	const hex = strToBytes32Hex("#BestWishes")
	for(var i=0; i<payeeList.length; i++) {
		passphraseHashList.push(hex)
		memoEncList.push("0x")
	}	
	console.log("from", from)
	console.log("deadlineTimestamp", deadlineTimestamp)
        const gasLimit = await chequeContract.estimateGas.writeCheques(payeeList, coinType, sendAmt,
			deadlineTimestamp, passphraseHashList, memoEncList, {from: from})
	console.log("gasLimit", gasLimit)

        const tx = await chequeContract.writeCheques(payeeList, coinType, sendAmt, deadlineTimestamp,
			passphraseHashList, memoEncList, {gasPrice: gasPrice, gasLimit: gasLimit})
        const receipt = await tx.wait()
	console.log(receipt)
}

async function run() {
	const ChequeABI = [
	  "function writeCheques(address[] calldata payeeList, address coinType, uint96 amount, uint64 deadline, uint[] calldata passphraseHashList, bytes[] calldata memoList) external payable",
	]

	const ChequeContractAddress = "0xfC4956e6e9EBA4F22b42Ef67C9aEA5f43e58f700"

	//const provider = new ethers.providers.JsonRpcProvider("https://smartbch.fountainhead.cash/mainnet")
	const provider = new ethers.providers.JsonRpcProvider("https://global.uat.cash")
	const gasPrice = await provider.getGasPrice()
	const key = fs.readFileSync("key.txt").toString().trim()
	//console.log("key", key)
	const signer = new ethers.Wallet("0x"+key, provider)
	const from = await signer.getAddress()
	const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
	const payeeList = ["0x5009102757a4b26f5F361E030AAF2F7D199b6c2c", "0x5637c9fbFf9FAf5f534d0a88199feCD97357635B"]
	await writeCheques(payeeList, chequeContract, gasPrice, from)
}

run()
 
