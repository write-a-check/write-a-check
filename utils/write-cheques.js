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
	const coinType = "0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B"
	const sendAmt = ethers.utils.parseUnits("2.08", 18)
	const deadline = Date.now() + 7*24*3600*1000
	const deadlineTimestamp = Math.floor(deadline / 1000)
	var passphraseHashList = []
	var memoEncList = []
	const hex = strToBytes32Hex("#EBEN to da moon")
	for(var i=0; i<payeeList.length; i++) {
		passphraseHashList.push(hex)
		memoEncList.push("0x")
	}	
	console.log("from", from)
	console.log("deadlineTimestamp", deadlineTimestamp)
        var gasLimit = await chequeContract.estimateGas.writeCheques(payeeList, coinType, sendAmt,
			deadlineTimestamp, passphraseHashList, memoEncList, {from: from})
	gasLimit = gasLimit.add(ethers.BigNumber.from(10*10000))
	console.log("gasLimit", gasLimit)

        const tx = await chequeContract.writeCheques(payeeList, coinType, sendAmt, deadlineTimestamp,
			passphraseHashList, memoEncList, {gasPrice: gasPrice, gasLimit: gasLimit})
        const receipt = await tx.wait()
	console.log(receipt)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run(payeeList) {
	const ChequeABI = [
	  "function writeCheques(address[] calldata payeeList, address coinType, uint96 amount, uint64 deadline, uint[] calldata passphraseHashList, bytes[] calldata memoList) external payable",
	]

	const ChequeContractAddress = "0xfC4956e6e9EBA4F22b42Ef67C9aEA5f43e58f700"

	const provider = new ethers.providers.JsonRpcProvider("https://smartbch.fountainhead.cash/mainnet")
	//const provider = new ethers.providers.JsonRpcProvider("https://global.uat.cash")
	const gasPrice = await provider.getGasPrice()
	console.log("gasPrice", gasPrice)
	const key = fs.readFileSync("key.txt").toString().trim()
	//console.log("key", key)
	const signer = new ethers.Wallet("0x"+key, provider)
	const from = await signer.getAddress()
	const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
	for(var start = 200; start < payeeList.length; start += 100) {
		var end = start + 100
		if(end > payeeList.length) {end = payeeList.length}
		console.log("====== start end", start, end)
		var list = payeeList.slice(start, end)
		await writeCheques(list, chequeContract, gasPrice, from)
		await sleep(15*1000)
	}
}

run(["0xa8Af25d86D0aE546C3Ad0b710193cB972d43fCAC", "0x5637c9fbFf9FAf5f534d0a88199feCD97357635B"])
 
