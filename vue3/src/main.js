import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'

window.ChequeABI = [
  "function encryptionPubkeys(address) external view returns (uint)",
  "function getChequeContent(uint id) external view returns (address coinType, uint96 amount, address drawer, uint64 deadline, bytes32 passphraseHash)",
  "function setEncryptionPubkey(uint key, address referee) external",
  "function unsetEncryptionPubkey() external",
  "function writeCheques(address[] calldata payeeList, address coinType, uint96 amount, uint64 deadline, uint[] calldata passphraseHashList, bytes[] calldata memoList) external payable",
  "function writeCheque(address payee, address coinType, uint96 amount, uint64 deadline, uint passphraseHash, bytes calldata memo) external payable",
  "function revokeCheques(uint[] calldata idList) external",
  "function revokeCheque(uint id) public",
  "function acceptCheques(uint[] calldata idList, bytes calldata passphrase) external",
  "function refuseCheques(uint[] calldata idList) external",
  "function acceptCheque(uint id, bytes calldata passphrase) external",
  "function refuseCheque(uint id) external"]

window.chequeBytecode = "0x608060405234801561001057600080fd5b50611bf4806100206000396000f3fe6080604052600436106100a75760003560e01c80638e4e43a4116100645780638e4e43a4146101ce578063a15a890f146101ee578063cbc1228d1461020e578063cd0b8bee1461022e578063db8e238414610241578063f7fdc6dd1461025457600080fd5b8063163e7c62146100ac57806335cb33db146100ce578063537739161461010e5780635faf2263146101795780636653637f14610199578063876c07f4146101ae575b600080fd5b3480156100b857600080fd5b506100cc6100c73660046118f1565b610274565b005b3480156100da57600080fd5b506100fb6100e93660046116a2565b60006020819052908152604090205481565b6040519081526020015b60405180910390f35b34801561011a57600080fd5b5061012e6101293660046118f1565b610292565b604080516001600160a01b0396871681526001600160601b0395909516602086015292909416918301919091526001600160401b03166060820152608081019190915260a001610105565b34801561018557600080fd5b506100cc610194366004611823565b6102cd565b3480156101a557600080fd5b506100cc610323565b3480156101ba57600080fd5b506100cc6101c93660046118f1565b61035d565b3480156101da57600080fd5b506100cc6101e9366004611823565b61048b565b3480156101fa57600080fd5b506100cc610209366004611864565b6104ce565b34801561021a57600080fd5b506100cc61022936600461194f565b61054c565b6100cc61023c366004611753565b61058e565b6100cc61024f3660046116c4565b61092e565b34801561026057600080fd5b506100cc61026f366004611923565b610bd2565b6040805160008082526020820190925261028f918391610c29565b50565b6000806000806000806102a487610e30565b8051602082015160408301516060840151608090940151929b919a509850919650945092505050565b60408051600080825260208201909252905b8281101561031d5761030b8484838181106102fc576102fc611ba8565b90506020020135600084610c29565b8061031581611b77565b9150506102df565b50505050565b33600081815260208190526040808220829055517f28f1a757c69b495383be7a1dfeb83d7d39c412913818674809b4fbac919e7aae9190a2565b600061036882610e30565b905080606001516001600160401b0316600014156103c15760405162461bcd60e51b81526020600482015260116024820152706368657175652d6e6f742d65786973747360781b60448201526064015b60405180910390fd5b4281606001516001600160401b0316106104155760405162461bcd60e51b81526020600482015260156024820152747374696c6c2d6265666f72652d646561646c696e6560581b60448201526064016103b8565b61041e82610fbd565b61043e8160000151826040015183602001516001600160601b03166110b8565b80604001516001600160a01b031682606084901c6001600160a01b03167f55282b3ab21725a5295da66b30787da30fca15979218d125e98dc4a9776d9f0760405160405180910390a45050565b60005b818110156104c9576104b78383838181106104ab576104ab611ba8565b9050602002013561035d565b806104c181611b77565b91505061048e565b505050565b60005b83811015610545576105338585838181106104ee576104ee611ba8565b90506020020135600185858080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250610c2992505050565b8061053d81611b77565b9150506104d1565b5050505050565b6104c983600184848080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250610c2992505050565b878314801561059c57508781145b6105da5760405162461bcd60e51b815260206004820152600f60248201526e0d8cadccee8d05adad2e6dac2e8c6d608b1b60448201526064016103b8565b42856001600160401b0316116106255760405162461bcd60e51b815260206004820152601060248201526f696e76616c69642d646561646c696e6560801b60448201526064016103b8565b6001600160601b0386166001600160a01b038816612711141561069957610655896001600160601b038916611b15565b34146106945760405162461bcd60e51b815260206004820152600e60248201526d0ecc2d8eaca5adad2e6dac2e8c6d60931b60448201526064016103b8565b610895565b34156106d75760405162461bcd60e51b815260206004820152600d60248201526c0c8dedce85ae6cadcc85ac4c6d609b1b60448201526064016103b8565b6040516370a0823160e01b81523060048201526000906001600160a01b038a16906370a082319060240160206040518083038186803b15801561071957600080fd5b505afa15801561072d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610751919061190a565b90506001600160a01b0389166323b872dd33306107778e6001600160601b038e16611b15565b6040516001600160e01b031960e086901b1681526001600160a01b0393841660048201529290911660248301526044820152606401602060405180830381600087803b1580156107c657600080fd5b505af11580156107da573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107fe91906118cf565b506040516370a0823160e01b81523060048201526000906001600160a01b038b16906370a082319060240160206040518083038186803b15801561084157600080fd5b505afa158015610855573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610879919061190a565b90508a6108868383611b34565b6108909190611af3565b925050505b60005b898110156109215761090f8b8b838181106108b5576108b5611ba8565b90506020020160208101906108ca91906116a2565b8a848a8a8a878181106108df576108df611ba8565b905060200201358989888181106108f8576108f8611ba8565b905060200281019061090a9190611a95565b61119d565b8061091981611b77565b915050610898565b5050505050505050505050565b42846001600160401b0316116109795760405162461bcd60e51b815260206004820152601060248201526f696e76616c69642d646561646c696e6560801b60448201526064016103b8565b6001600160601b0385166001600160a01b03871661271114156109e457856001600160601b031634146109df5760405162461bcd60e51b815260206004820152600e60248201526d0ecc2d8eaca5adad2e6dac2e8c6d60931b60448201526064016103b8565b610bb9565b3415610a225760405162461bcd60e51b815260206004820152600d60248201526c0c8dedce85ae6cadcc85ac4c6d609b1b60448201526064016103b8565b6040516370a0823160e01b81523060048201526000906001600160a01b038916906370a082319060240160206040518083038186803b158015610a6457600080fd5b505afa158015610a78573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a9c919061190a565b6040516323b872dd60e01b81523360048201523060248201526001600160601b03891660448201529091506001600160a01b038916906323b872dd90606401602060405180830381600087803b158015610af557600080fd5b505af1158015610b09573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b2d91906118cf565b506040516370a0823160e01b81523060048201526000906001600160a01b038a16906370a082319060240160206040518083038186803b158015610b7057600080fd5b505afa158015610b84573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ba8919061190a565b9050610bb48282611b34565b925050505b610bc88888838888888861119d565b5050505050505050565b336000818152602081815260409182902085905581516001600160a01b03851681529081018590527fca6ad40ddda258ce3df984c1c58b35dd1fa465dd19cbecba7346a98c7008453b910160405180910390a25050565b33606084901c14610c685760405162461bcd60e51b81526020600482015260096024820152686e6f742d706179656560b81b60448201526064016103b8565b6000610c7384610e30565b905080606001516001600160401b031660001415610cc75760405162461bcd60e51b81526020600482015260116024820152706368657175652d6e6f742d65786973747360781b60448201526064016103b8565b80606001516001600160401b0316421115610d155760405162461bcd60e51b815260206004820152600e60248201526d61667465722d646561646c696e6560901b60448201526064016103b8565b338315610dcc5760f88260800151901c602314610d8257825160208401206080830151600882811b91901b14610d805760405162461bcd60e51b815260206004820152601060248201526f77726f6e672d7061737370687261736560801b60448201526064016103b8565b505b81604001516001600160a01b031685336001600160a01b03167f7c034fd89f31e2055d33b52660024ed09002226149a00e494a58472ef7f1ed7f60405160405180910390a4610e0b565b5060408082015190516001600160a01b03821690869033907fb92b62a11bbc0d8411fb5a2c72f4b0b51ea1b3df1849b2b6deca43a97a8bdd4290600090a45b610e1485610fbd565b61054582600001518284602001516001600160601b03166110b8565b6040805160a081018252600080825260208201819052918101829052606081018290526080810191909152600082604051602001610e7091815260200190565b60408051601f19818403018152908290529150600090819061271290610e9a908590602401611a10565b60408051601f198184030181529181526020820180516001600160e01b031663d6d7d52560e01b17905251610ecf91906119f4565b600060405180830381855af49150503d8060008114610f0a576040519150601f19603f3d011682016040523d82523d6000602084013e610f0f565b606091505b5091509150818015610f2d5750805160401480610f2d5750805160a0145b610f3657600080fd5b805160401415610f4f5750506000606083015250919050565b6060604082019050600080600083806020019051810190610f70919061199a565b606083811c8c526001600160601b0390931660208c0152604082811c6001600160a01b0316908c01526001600160401b03909116918a019190915260808901525095979650505050505050565b600081604051602001610fd291815260200190565b60408051601f19818403018152600080845260208401909252925080612712610fff858560448101611a23565b60408051601f198184030181529181526020820180516001600160e01b03166350c63a8f60e11b1790525161103491906119f4565b600060405180830381855af49150503d806000811461106f576040519150601f19603f3d011682016040523d82523d6000602084013e611074565b606091505b5091509150816105455760405162461bcd60e51b815260206004820152600f60248201526e14d1540c4c0c57d1115317d1905253608a1b60448201526064016103b8565b6040516001600160a01b03838116602483015260448201839052600091829186169060640160408051601f198184030181529181526020820180516001600160e01b031663a9059cbb60e01b1790525161111291906119f4565b6000604051808303816000865af19150503d806000811461114f576040519150601f19603f3d011682016040523d82523d6000602084013e611154565b606091505b5091509150816105455760405162461bcd60e51b815260206004820152601460248201527314d1540c8c0d97d514905394d1915497d190525360621b60448201526064016103b8565b6001600160a01b0387166000908152602081905260409020546111f25760405162461bcd60e51b815260206004820152600d60248201526c6e6f2d656e632d7075626b657960981b60448201526064016103b8565b6111ff4262278d00611adb565b846001600160401b0316106112565760405162461bcd60e51b815260206004820152601a60248201527f646561646c696e652d6d7573742d696e2d6f6e652d6d6f6e746800000000000060448201526064016103b8565b336001600160601b0319606089901b164360201b1763ffffff00600883901b16175b6112818161136d565b15611298578061129081611b77565b915050611278565b6040805160a08101825233918101919091526001600160401b03871660608201526001600160a01b0389168152608081018690526001600160601b03881660208201526112e58282611455565b604080516001600160601b031960608c901b166001600160601b038b16179142901b6001600160401b038a161790339085906001600160a01b038f16907f5a8039e362c5082b85db686c7a1ba5274e97d4bf7af46f352f3fcb60d9b3903e9061135790879087908f908f908f90611a51565b60405180910390a4505050505050505050505050565b6000808260405160200161138391815260200190565b60408051601f198184030181529082905291506000908190612712906113ad908590602401611a10565b60408051601f198184030181529181526020820180516001600160e01b031663d6d7d52560e01b179052516113e291906119f4565b600060405180830381855af49150503d806000811461141d576040519150601f19603f3d011682016040523d82523d6000602084013e611422565b606091505b509150915081801561144057508051604014806114405750805160a0145b61144957600080fd5b5160a014949350505050565b60008260405160200161146a91815260200190565b60408051808303601f190181528282528451602080870151878501516060808a01516080808c01516001600160601b0390951696831b6001600160601b031916969096179489018590526001600160401b031691871b68010000000000000000600160e01b03169190911795870186905286015291945090926000910160408051601f198184030181529082905291506000908190612712906115139088908690602401611a23565b60408051601f198184030181529181526020820180516001600160e01b03166350c63a8f60e11b1790525161154891906119f4565b600060405180830381855af49150503d8060008114611583576040519150601f19603f3d011682016040523d82523d6000602084013e611588565b606091505b509150915081610bc85760405162461bcd60e51b815260206004820152600f60248201526e14d1540c4c0c57d4d15517d1905253608a1b60448201526064016103b8565b80356001600160a01b03811681146115e357600080fd5b919050565b60008083601f8401126115fa57600080fd5b5081356001600160401b0381111561161157600080fd5b6020830191508360208260051b850101111561162c57600080fd5b9250929050565b60008083601f84011261164557600080fd5b5081356001600160401b0381111561165c57600080fd5b60208301915083602082850101111561162c57600080fd5b80356001600160401b03811681146115e357600080fd5b80356001600160601b03811681146115e357600080fd5b6000602082840312156116b457600080fd5b6116bd826115cc565b9392505050565b600080600080600080600060c0888a0312156116df57600080fd5b6116e8886115cc565b96506116f6602089016115cc565b95506117046040890161168b565b945061171260608901611674565b93506080880135925060a08801356001600160401b0381111561173457600080fd5b6117408a828b01611633565b989b979a50959850939692959293505050565b600080600080600080600080600060c08a8c03121561177157600080fd5b89356001600160401b038082111561178857600080fd5b6117948d838e016115e8565b909b5099508991506117a860208d016115cc565b98506117b660408d0161168b565b97506117c460608d01611674565b965060808c01359150808211156117da57600080fd5b6117e68d838e016115e8565b909650945060a08c01359150808211156117ff57600080fd5b5061180c8c828d016115e8565b915080935050809150509295985092959850929598565b6000806020838503121561183657600080fd5b82356001600160401b0381111561184c57600080fd5b611858858286016115e8565b90969095509350505050565b6000806000806040858703121561187a57600080fd5b84356001600160401b038082111561189157600080fd5b61189d888389016115e8565b909650945060208701359150808211156118b657600080fd5b506118c387828801611633565b95989497509550505050565b6000602082840312156118e157600080fd5b815180151581146116bd57600080fd5b60006020828403121561190357600080fd5b5035919050565b60006020828403121561191c57600080fd5b5051919050565b6000806040838503121561193657600080fd5b82359150611946602084016115cc565b90509250929050565b60008060006040848603121561196457600080fd5b8335925060208401356001600160401b0381111561198157600080fd5b61198d86828701611633565b9497909650939450505050565b6000806000606084860312156119af57600080fd5b8351925060208401519150604084015190509250925092565b600081518084526119e0816020860160208601611b4b565b601f01601f19169290920160200192915050565b60008251611a06818460208701611b4b565b9190910192915050565b6020815260006116bd60208301846119c8565b604081526000611a3660408301856119c8565b8281036020840152611a4881856119c8565b95945050505050565b85815284602082015283604082015260806060820152816080820152818360a0830137600081830160a090810191909152601f909201601f19160101949350505050565b6000808335601e19843603018112611aac57600080fd5b8301803591506001600160401b03821115611ac657600080fd5b60200191503681900382131561162c57600080fd5b60008219821115611aee57611aee611b92565b500190565b600082611b1057634e487b7160e01b600052601260045260246000fd5b500490565b6000816000190483118215151615611b2f57611b2f611b92565b500290565b600082821015611b4657611b46611b92565b500390565b60005b83811015611b66578181015183820152602001611b4e565b8381111561031d5750506000910152565b6000600019821415611b8b57611b8b611b92565b5060010190565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052603260045260246000fdfea26469706673582212200031f235fdb766b927580e4d8c95ada34bfe23f48c72399728371dd7cd7c208464736f6c63430008060033"
	
window.SEP20ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address recipient, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"]

window.ChequeContractAddress = "0xC618D798f5270fc4d6fF70AA42B5e3ed2171108b"

window.alertNoWallet = () => {
      alert("No wallet installed! Please install MetaMask or other web3 wallet to use this App.");
}

if (typeof window.ethereum === 'undefined') {
  alertNoWallet()
} else {
  ethereum.request({ method: 'eth_requestAccounts' })
}

window.getSEP20AddrAndSymbol = async function(line) {
      var trimmed = line.trim()
      if(trimmed.length!=42) {//not hex, so it is a symbol
         const hexAddr = localStorage.getItem("coin-"+trimmed)
	 if(trimmed === null) {
	   alert("Cannot find "+trimmed+"'s address in history. Please enter a HEX address.")
	   return [null, null]
	 }
	 trimmed = hexAddr
      }
      var sep20Addr, symbol;
      try {
        sep20Addr = ethers.utils.getAddress(trimmed)
      } catch(e) {
        alert("Invalid Address: "+trimmed)
	return [null, null]
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const sep20Contract = new ethers.Contract(sep20Addr, SEP20ABI, provider)
      try {
        symbol = await sep20Contract.symbol()
      } catch(e) {
        alert("Not an SEP20 Address: "+sep20Addr)
	return [null, null]
      }
      localStorage.setItem("coin-"+symbol, sep20Addr)
      return [sep20Addr, symbol]
}

window.timestamp2string = function(timestamp) {
  var t = new Date()
  t.setTime(timestamp)
  return t.toLocaleString()
}

window.uint8ArrayToHex = function(buffer) {
  return Array.prototype.map.call(buffer, x => x.toString(16).padStart(2, '0')).join('');
}

window.strToBytes32Hex = function(s) {
  const encoder = new TextEncoder()
  const encData = encoder.encode(s)
  const hex = uint8ArrayToHex(encData)
  return "0x"+hex+("0".repeat(Math.max(0, 64-hex.length)))
}

window.uint8ArrayFromHex = function(s) {
  var u8arr = new Uint8Array(Math.ceil(s.length / 2));
  for (var i = 0; i < u8arr.length; i++) {
    u8arr[i] = parseInt(s.substr(i * 2, 2), 16);
  }
  return u8arr
}

window.strFromHex = function(hex) {
  const data = uint8ArrayFromHex(hex)
  const decoder = new TextDecoder("utf-8")
  return decoder.decode(data)
}

window.getCoinSymbolAndDecimals = async function(coinInfoMap, coinType) {
  if(coinInfoMap.has(coinType)) {
    return coinInfoMap.get(coinType)
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const sep20Contract = new ethers.Contract(coinType, SEP20ABI, provider)
  const symbol = await sep20Contract.symbol()
  const decimals = await sep20Contract.decimals()
  coinInfoMap.set(coinType, [symbol, decimals])
  return [symbol, decimals]
}

window.parseNewCheque = async function(coinInfoMap, topics, data) {
  var cheque = {}
  cheque.drawer = ethers.utils.getAddress("0x"+topics[3].substr(26))
  cheque.id = topics[2]
  cheque.payee = ethers.utils.getAddress("0x"+topics[1].substr(26))
  const coinTypeAndAmount = data.substr(2, 64)
  const startAndEndTime = data.substr(2+64, 64)
  cheque.passphraseHash = "0x"+data.substr(2+64*2, 64)
  const memoLength = ethers.BigNumber.from("0x"+data.substr(2+64*4, 64)).toNumber()
  cheque.encryptedMemo = "0x"+data.substr(2+64*5, memoLength*2) //skip memo's offset and length
  cheque.coinType = ethers.utils.getAddress("0x"+coinTypeAndAmount.substr(0, 20*2))
  const [symbol, decimals] = await getCoinSymbolAndDecimals(coinInfoMap, cheque.coinType)
  cheque.coinSymbol = symbol
  const amt = ethers.BigNumber.from("0x"+coinTypeAndAmount.substr(20*2, 12*2))
  cheque.amount = ethers.utils.formatUnits(amt, decimals)
  cheque.startTime = ethers.BigNumber.from("0x"+startAndEndTime.substr(16*2, 8*2)).toNumber()
  cheque.deadline = ethers.BigNumber.from("0x"+startAndEndTime.substr(24*2, 8*2)).toNumber()
  cheque.startTimeStr = timestamp2string(cheque.startTime*1000)
  cheque.deadlineStr = timestamp2string(cheque.deadline*1000)
  cheque.hasTag = cheque.passphraseHash.substr(2,2) == "23" // 0x23 is '#'
  if(cheque.deadline*1000 <= Date.now()) {
    cheque.status = "expired"
  } else {
    cheque.status = "active"
  }
  if(cheque.hasTag) cheque.tag = strFromHex(cheque.passphraseHash)
  return cheque
}

window.NewCheque = ethers.utils.id("NewCheque(address,uint256,address,uint256,uint256,uint256,bytes)")
window.RevokeCheque = ethers.utils.id("RevokeCheque(address,uint256,address)")
window.AcceptCheque = ethers.utils.id("AcceptCheque(address,uint256,address)")
window.RefuseCheque = ethers.utils.id("RefuseCheque(address,uint256,address)")
// const SetEncryptionPubkey = ethers.utils.id("SetEncryptionPubkey(address,address,uint256)")
// const UnsetEncryptionPubkey = ethers.utils.id("UnsetEncryptionPubkey(address)")

createApp(App).use(router).mount('#app')

// Account1: 0x5637c9fbFf9FAf5f534d0a88199feCD97357635B
// Account2: 0xd6c5F62c58238bfF1210b53ED5d1b2224EBC5176
// Account3: 0x732B170AB666146ea3752c81b27E85d215EEb190
// ABC: 0xc0afb01d2c33c8b8c7674e2647d838c12b135f74
// XYZ: 0x2021bf6D0C13554E1A1feF1BD0C064315421bDc7
