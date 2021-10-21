const { ethers } = require("ethers");
const fs = require("fs");

const ChequeContractAddress = "0xa36C479eEAa25C0CFC7e099D3bEbF7A7F1303F40"

async function revokeCheques(chequeList, chequeContract, gasPrice, from) {
        var gasLimit = await chequeContract.estimateGas.revokeCheques(chequeList, {from: from})
	gasLimit = gasLimit.add(ethers.BigNumber.from(10*10000))
	console.log("gasLimit", gasLimit)

        const tx = await chequeContract.revokeCheques(chequeList, {gasPrice: gasPrice, gasLimit: gasLimit})
        const receipt = await tx.wait()
	console.log(receipt)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run(revokeList) {
	const ChequeABI = [
	"function revokeCheques(uint[] calldata idList) external",
	]

	const provider = new ethers.providers.JsonRpcProvider("https://smartbch.fountainhead.cash/mainnet")
	//const provider = new ethers.providers.JsonRpcProvider("https://global.uat.cash")
	const gasPrice = await provider.getGasPrice()
	console.log("gasPrice", gasPrice)
	const key = fs.readFileSync("key.txt").toString().trim()
	//console.log("key", key)
	const signer = new ethers.Wallet("0x"+key, provider)
	const from = await signer.getAddress()
	const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
	for(var start = 0; start < chequeList.length; start += 200) {
		var end = start + 200
		if(end > chequeList.length) {end = chequeList.length}
		console.log("====== start end", start, end)
		var list = chequeList.slice(start, end)
		await revokeCheques(list, chequeContract, gasPrice, from)
		await sleep(15*1000)
	}
}

var chequeList = []
 
run(chequeList)
