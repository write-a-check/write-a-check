const { ethers } = require("ethers");

async function verifySecretTag(chequeID, secret) {
	const ChequeABI = [
	"function getChequeContent(uint id) external view returns (address coinType, uint96 amount, address drawer, uint64 deadline, uint tag)",
	"function acceptCheque(uint id, bytes calldata passphrase) external",
	]
	const ChequeContractAddress = "0xa36C479eEAa25C0CFC7e099D3bEbF7A7F1303F40"
	const provider = new ethers.providers.JsonRpcProvider("https://smartbch.fountainhead.cash/mainnet")
	const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider)
	const cheque = await chequeContract.getChequeContent(chequeID)
	const payee = ethers.utils.getAddress(chequeID.substr(0,42))
	const tag = cheque.tag.toHexString()
	const hasPlainTag = ((tag.substr(2,2) == "23") && (tag.length == 66)) // 0x23 is '#'
	const hasSecretTag = !(cheque.tag.isZero() || hasPlainTag)
	const salt = cheque.deadline.toString()+" "+payee.substr(2)+" "
	
	if(hasSecretTag) {
		const passphrase = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(salt+secret))
        	try {
        		const gasPrice = ethers.BigNumber.from("0x3e63fa64")
        		await chequeContract.estimateGas.acceptCheque(chequeID, passphrase, {from: payee, gasPrice: gasPrice})
        	} catch(e) {
			//console.log(e)
			console.log("Failed to estimate gas, maybe you entered incorrect passphrase")
			return
		}
		console.log("The secret tag '"+secret+"' is correct")
	}
	
}

verifySecretTag("0x5637c9fbff9faf5f534d0a88199fecd97357635b000000000012ba32ca248700", "hello")
