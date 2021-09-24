import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'

window.SEP206Address = "0x0000000000000000000000000000000000002711"

window.ChequeABI = [
  "function encryptionPubkeys(address) external view returns (uint)",
  "function batchReadEncryptionPubkeys(address[] calldata addrList) view external returns(uint[] memory)",
  "function setEncryptionPubkey(uint key, address referee) external",
  "function unsetEncryptionPubkey() external",
  "function writeCheques(address[] calldata payeeList, address coinType, uint96 amount, uint64 deadline, uint[] calldata passphraseHashList, bytes[] calldata memoList) external payable",
  "function writeCheque(address payee, address coinType, uint96 amount, uint64 deadline, uint passphraseHash, bytes calldata memo) external payable",
  "function revokeCheques(uint[] calldata idList) external",
  "function acceptCheques(uint[] calldata idList) external",
  "function refuseCheques(uint[] calldata idList) external",
  "function acceptCheque(uint id, bytes calldata passphrase) external",
  "function refuseCheque(uint id) external"]

window.chequeBytecode = "0x608060405234801561001057600080fd5b50611d82806100206000396000f3fe6080604052600436106100c25760003560e01c80638e4e43a41161007f578063cd0b8bee11610059578063cd0b8bee14610249578063db8e23841461025c578063e37c3cb01461026f578063f7fdc6dd1461029c57600080fd5b80638e4e43a4146101e9578063a15a890f14610209578063cbc1228d1461022957600080fd5b8063163e7c62146100c757806335cb33db146100e957806353773916146101295780635faf2263146101945780636653637f146101b4578063876c07f4146101c9575b600080fd5b3480156100d357600080fd5b506100e76100e2366004611a25565b6102bc565b005b3480156100f557600080fd5b506101166101043660046117d6565b60006020819052908152604090205481565b6040519081526020015b60405180910390f35b34801561013557600080fd5b50610149610144366004611a25565b6102da565b604080516001600160a01b0396871681526001600160601b0395909516602086015292909416918301919091526001600160401b03166060820152608081019190915260a001610120565b3480156101a057600080fd5b506100e76101af366004611887565b610315565b3480156101c057600080fd5b506100e761036b565b3480156101d557600080fd5b506100e76101e4366004611a25565b6103a5565b3480156101f557600080fd5b506100e7610204366004611887565b6104d3565b34801561021557600080fd5b506100e7610224366004611998565b610516565b34801561023557600080fd5b506100e7610244366004611a83565b610594565b6100e76102573660046118c8565b6105d6565b6100e761026a3660046117f8565b610976565b34801561027b57600080fd5b5061028f61028a366004611887565b610c1a565b6040516101209190611b44565b3480156102a857600080fd5b506100e76102b7366004611a57565b610cef565b604080516000808252602082019092526102d7918391610d46565b50565b6000806000806000806102ec87610f5e565b8051602082015160408301516060840151608090940151929b919a509850919650945092505050565b60408051600080825260208201909252905b828110156103655761035384848381811061034457610344611d20565b90506020020135600084610d46565b8061035d81611cef565b915050610327565b50505050565b33600081815260208190526040808220829055517f28f1a757c69b495383be7a1dfeb83d7d39c412913818674809b4fbac919e7aae9190a2565b60006103b082610f5e565b905080606001516001600160401b0316600014156104095760405162461bcd60e51b81526020600482015260116024820152706368657175652d6e6f742d65786973747360781b60448201526064015b60405180910390fd5b4281606001516001600160401b03161061045d5760405162461bcd60e51b81526020600482015260156024820152747374696c6c2d6265666f72652d646561646c696e6560581b6044820152606401610400565b610466826110eb565b6104868160000151826040015183602001516001600160601b03166111e6565b80604001516001600160a01b031682606084901c6001600160a01b03167f55282b3ab21725a5295da66b30787da30fca15979218d125e98dc4a9776d9f0760405160405180910390a45050565b60005b81811015610511576104ff8383838181106104f3576104f3611d20565b905060200201356103a5565b8061050981611cef565b9150506104d6565b505050565b60005b8381101561058d5761057b85858381811061053657610536611d20565b90506020020135600185858080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250610d4692505050565b8061058581611cef565b915050610519565b5050505050565b61051183600184848080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250610d4692505050565b87831480156105e457508781145b6106225760405162461bcd60e51b815260206004820152600f60248201526e0d8cadccee8d05adad2e6dac2e8c6d608b1b6044820152606401610400565b42856001600160401b03161161066d5760405162461bcd60e51b815260206004820152601060248201526f696e76616c69642d646561646c696e6560801b6044820152606401610400565b6001600160601b0386166001600160a01b03881661271114156106e15761069d896001600160601b038916611c8d565b34146106dc5760405162461bcd60e51b815260206004820152600e60248201526d0ecc2d8eaca5adad2e6dac2e8c6d60931b6044820152606401610400565b6108dd565b341561071f5760405162461bcd60e51b815260206004820152600d60248201526c0c8dedce85ae6cadcc85ac4c6d609b1b6044820152606401610400565b6040516370a0823160e01b81523060048201526000906001600160a01b038a16906370a082319060240160206040518083038186803b15801561076157600080fd5b505afa158015610775573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107999190611a3e565b90506001600160a01b0389166323b872dd33306107bf8e6001600160601b038e16611c8d565b6040516001600160e01b031960e086901b1681526001600160a01b0393841660048201529290911660248301526044820152606401602060405180830381600087803b15801561080e57600080fd5b505af1158015610822573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108469190611a03565b506040516370a0823160e01b81523060048201526000906001600160a01b038b16906370a082319060240160206040518083038186803b15801561088957600080fd5b505afa15801561089d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108c19190611a3e565b90508a6108ce8383611cac565b6108d89190611c6b565b925050505b60005b89811015610969576109578b8b838181106108fd576108fd611d20565b905060200201602081019061091291906117d6565b8a848a8a8a8781811061092757610927611d20565b9050602002013589898881811061094057610940611d20565b90506020028101906109529190611c0d565b6112cb565b8061096181611cef565b9150506108e0565b5050505050505050505050565b42846001600160401b0316116109c15760405162461bcd60e51b815260206004820152601060248201526f696e76616c69642d646561646c696e6560801b6044820152606401610400565b6001600160601b0385166001600160a01b0387166127111415610a2c57856001600160601b03163414610a275760405162461bcd60e51b815260206004820152600e60248201526d0ecc2d8eaca5adad2e6dac2e8c6d60931b6044820152606401610400565b610c01565b3415610a6a5760405162461bcd60e51b815260206004820152600d60248201526c0c8dedce85ae6cadcc85ac4c6d609b1b6044820152606401610400565b6040516370a0823160e01b81523060048201526000906001600160a01b038916906370a082319060240160206040518083038186803b158015610aac57600080fd5b505afa158015610ac0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ae49190611a3e565b6040516323b872dd60e01b81523360048201523060248201526001600160601b03891660448201529091506001600160a01b038916906323b872dd90606401602060405180830381600087803b158015610b3d57600080fd5b505af1158015610b51573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b759190611a03565b506040516370a0823160e01b81523060048201526000906001600160a01b038a16906370a082319060240160206040518083038186803b158015610bb857600080fd5b505afa158015610bcc573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bf09190611a3e565b9050610bfc8282611cac565b925050505b610c10888883888888886112cb565b5050505050505050565b60606000826001600160401b03811115610c3657610c36611d36565b604051908082528060200260200182016040528015610c5f578160200160208202803683370190505b50905060005b83811015610ce757600080868684818110610c8257610c82611d20565b9050602002016020810190610c9791906117d6565b6001600160a01b03166001600160a01b0316815260200190815260200160002054828281518110610cca57610cca611d20565b602090810291909101015280610cdf81611cef565b915050610c65565b509392505050565b336000818152602081815260409182902085905581516001600160a01b03851681529081018590527fca6ad40ddda258ce3df984c1c58b35dd1fa465dd19cbecba7346a98c7008453b910160405180910390a25050565b33606084901c14610d855760405162461bcd60e51b81526020600482015260096024820152686e6f742d706179656560b81b6044820152606401610400565b6000610d9084610f5e565b905080606001516001600160401b031660001415610de45760405162461bcd60e51b81526020600482015260116024820152706368657175652d6e6f742d65786973747360781b6044820152606401610400565b80606001516001600160401b0316421115610e325760405162461bcd60e51b815260206004820152600e60248201526d61667465722d646561646c696e6560901b6044820152606401610400565b338315610efa57608082015115801590610e55575060f88260800151901c602314155b15610eb057825160208401206080830151600882811b91901b14610eae5760405162461bcd60e51b815260206004820152601060248201526f77726f6e672d7061737370687261736560801b6044820152606401610400565b505b81604001516001600160a01b031685336001600160a01b03167f7c034fd89f31e2055d33b52660024ed09002226149a00e494a58472ef7f1ed7f60405160405180910390a4610f39565b5060408082015190516001600160a01b03821690869033907fb92b62a11bbc0d8411fb5a2c72f4b0b51ea1b3df1849b2b6deca43a97a8bdd4290600090a45b610f42856110eb565b61058d82600001518284602001516001600160601b03166111e6565b6040805160a081018252600080825260208201819052918101829052606081018290526080810191909152600082604051602001610f9e91815260200190565b60408051601f19818403018152908290529150600090819061271290610fc8908590602401611b88565b60408051601f198184030181529181526020820180516001600160e01b031663d6d7d52560e01b17905251610ffd9190611b28565b600060405180830381855af49150503d8060008114611038576040519150601f19603f3d011682016040523d82523d6000602084013e61103d565b606091505b509150915081801561105b575080516040148061105b5750805160a0145b61106457600080fd5b80516040141561107d5750506000606083015250919050565b606060408201905060008060008380602001905181019061109e9190611ace565b606083811c8c526001600160601b0390931660208c0152604082811c6001600160a01b0316908c01526001600160401b03909116918a019190915260808901525095979650505050505050565b60008160405160200161110091815260200190565b60408051601f1981840301815260008084526020840190925292508061271261112d858560448101611b9b565b60408051601f198184030181529181526020820180516001600160e01b03166350c63a8f60e11b179052516111629190611b28565b600060405180830381855af49150503d806000811461119d576040519150601f19603f3d011682016040523d82523d6000602084013e6111a2565b606091505b50915091508161058d5760405162461bcd60e51b815260206004820152600f60248201526e14d1540c4c0c57d1115317d1905253608a1b6044820152606401610400565b6040516001600160a01b03838116602483015260448201839052600091829186169060640160408051601f198184030181529181526020820180516001600160e01b031663a9059cbb60e01b179052516112409190611b28565b6000604051808303816000865af19150503d806000811461127d576040519150601f19603f3d011682016040523d82523d6000602084013e611282565b606091505b50915091508161058d5760405162461bcd60e51b815260206004820152601460248201527314d1540c8c0d97d514905394d1915497d190525360621b6044820152606401610400565b8015611326576001600160a01b0387166000908152602081905260409020546113265760405162461bcd60e51b815260206004820152600d60248201526c6e6f2d656e632d7075626b657960981b6044820152606401610400565b6113334262278d00611c53565b846001600160401b03161061138a5760405162461bcd60e51b815260206004820152601a60248201527f646561646c696e652d6d7573742d696e2d6f6e652d6d6f6e74680000000000006044820152606401610400565b336001600160601b0319606089901b164360201b1763ffffff00600883901b16175b6113b5816114a1565b156113cc57806113c481611cef565b9150506113ac565b6040805160a08101825233918101919091526001600160401b03871660608201526001600160a01b0389168152608081018690526001600160601b03881660208201526114198282611589565b604080516001600160601b031960608c901b166001600160601b038b16179142901b6001600160401b038a161790339085906001600160a01b038f16907f5a8039e362c5082b85db686c7a1ba5274e97d4bf7af46f352f3fcb60d9b3903e9061148b90879087908f908f908f90611bc9565b60405180910390a4505050505050505050505050565b600080826040516020016114b791815260200190565b60408051601f198184030181529082905291506000908190612712906114e1908590602401611b88565b60408051601f198184030181529181526020820180516001600160e01b031663d6d7d52560e01b179052516115169190611b28565b600060405180830381855af49150503d8060008114611551576040519150601f19603f3d011682016040523d82523d6000602084013e611556565b606091505b509150915081801561157457508051604014806115745750805160a0145b61157d57600080fd5b5160a014949350505050565b60008260405160200161159e91815260200190565b60408051808303601f190181528282528451602080870151878501516060808a01516080808c01516001600160601b0390951696831b6001600160601b031916969096179489018590526001600160401b031691871b68010000000000000000600160e01b03169190911795870186905286015291945090926000910160408051601f198184030181529082905291506000908190612712906116479088908690602401611b9b565b60408051601f198184030181529181526020820180516001600160e01b03166350c63a8f60e11b1790525161167c9190611b28565b600060405180830381855af49150503d80600081146116b7576040519150601f19603f3d011682016040523d82523d6000602084013e6116bc565b606091505b509150915081610c105760405162461bcd60e51b815260206004820152600f60248201526e14d1540c4c0c57d4d15517d1905253608a1b6044820152606401610400565b80356001600160a01b038116811461171757600080fd5b919050565b60008083601f84011261172e57600080fd5b5081356001600160401b0381111561174557600080fd5b6020830191508360208260051b850101111561176057600080fd5b9250929050565b60008083601f84011261177957600080fd5b5081356001600160401b0381111561179057600080fd5b60208301915083602082850101111561176057600080fd5b80356001600160401b038116811461171757600080fd5b80356001600160601b038116811461171757600080fd5b6000602082840312156117e857600080fd5b6117f182611700565b9392505050565b600080600080600080600060c0888a03121561181357600080fd5b61181c88611700565b965061182a60208901611700565b9550611838604089016117bf565b9450611846606089016117a8565b93506080880135925060a08801356001600160401b0381111561186857600080fd5b6118748a828b01611767565b989b979a50959850939692959293505050565b6000806020838503121561189a57600080fd5b82356001600160401b038111156118b057600080fd5b6118bc8582860161171c565b90969095509350505050565b600080600080600080600080600060c08a8c0312156118e657600080fd5b89356001600160401b03808211156118fd57600080fd5b6119098d838e0161171c565b909b50995089915061191d60208d01611700565b985061192b60408d016117bf565b975061193960608d016117a8565b965060808c013591508082111561194f57600080fd5b61195b8d838e0161171c565b909650945060a08c013591508082111561197457600080fd5b506119818c828d0161171c565b915080935050809150509295985092959850929598565b600080600080604085870312156119ae57600080fd5b84356001600160401b03808211156119c557600080fd5b6119d18883890161171c565b909650945060208701359150808211156119ea57600080fd5b506119f787828801611767565b95989497509550505050565b600060208284031215611a1557600080fd5b815180151581146117f157600080fd5b600060208284031215611a3757600080fd5b5035919050565b600060208284031215611a5057600080fd5b5051919050565b60008060408385031215611a6a57600080fd5b82359150611a7a60208401611700565b90509250929050565b600080600060408486031215611a9857600080fd5b8335925060208401356001600160401b03811115611ab557600080fd5b611ac186828701611767565b9497909650939450505050565b600080600060608486031215611ae357600080fd5b8351925060208401519150604084015190509250925092565b60008151808452611b14816020860160208601611cc3565b601f01601f19169290920160200192915050565b60008251611b3a818460208701611cc3565b9190910192915050565b6020808252825182820181905260009190848201906040850190845b81811015611b7c57835183529284019291840191600101611b60565b50909695505050505050565b6020815260006117f16020830184611afc565b604081526000611bae6040830185611afc565b8281036020840152611bc08185611afc565b95945050505050565b85815284602082015283604082015260806060820152816080820152818360a0830137600081830160a090810191909152601f909201601f19160101949350505050565b6000808335601e19843603018112611c2457600080fd5b8301803591506001600160401b03821115611c3e57600080fd5b60200191503681900382131561176057600080fd5b60008219821115611c6657611c66611d0a565b500190565b600082611c8857634e487b7160e01b600052601260045260246000fd5b500490565b6000816000190483118215151615611ca757611ca7611d0a565b500290565b600082821015611cbe57611cbe611d0a565b500390565b60005b83811015611cde578181015183820152602001611cc6565b838111156103655750506000910152565b6000600019821415611d0357611d03611d0a565b5060010190565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fdfea26469706673582212209387a54f20baf120f105a567d61f5e8fc01405219f8c8efab5f2d423498dd0e164736f6c63430008060033"
	
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

window.ChequeContractAddress = "0xa29eF06fb43Ac4f61E2cC9446089B0A829124237"

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
      if(trimmed==SEP206Address || trimmed=="BCH") {
        return [SEP206Address, "BCH"]
      }
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
  var u8arr = new Uint8Array(Math.ceil(s.length / 2)-1);
  var end = 0
  for (var i = 0; i < u8arr.length; i++) {//
    u8arr[i] = parseInt(s.substr(2/*ignore the leading '0x'*/+i*2, 2), 16);
    if(u8arr[i] == 0) {
      end = i
      break
    }
  }
  return u8arr.slice(0, end)
}

window.strFromHex = function(hex) {
  const data = uint8ArrayFromHex(hex)
  const decoder = new TextDecoder("utf-8")
  return decoder.decode(data)
}

window.getCoinSymbolAndDecimals = async function(coinInfoMap, coinType) {
  if(coinType == SEP206Address) {
    return ["BCH", 18]
  }
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
  cheque.withMemo = (memoLength != 0)
  if(cheque.withMemo) {
    cheque.encryptedMemo = "0x"+data.substr(2+64*5, memoLength*2) //skip memo's offset and length
  } else {
    cheque.encryptedMemo = "0x"
  }
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
  cheque.hasPassphrase = !(ethers.BigNumber.from(cheque.passphraseHash).isZero() || cheque.hasTag)
  if(cheque.deadline*1000 <= Date.now()) {
    cheque.status = "expired"
  } else {
    cheque.status = "active"
  }
  if(cheque.hasTag) cheque.tag = strFromHex(cheque.passphraseHash).substr(1) //remove the leading '#'
  return cheque
}

window.getPublicKey = async function() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const encryptionPublicKey = await window.ethereum.request({
    method: 'eth_getEncryptionPublicKey',
    params: [accounts[0]]
  })
  return encryptionPublicKey
}

window.switchAllow = async function(allowed, referee = null) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      var gasPrice = await provider.getStorageAt("0x0000000000000000000000000000000000002710","0x00000000000000000000000000000000000000000000000000000000000000002")
      if(gasPrice=="0x") {
        gasPrice = "0x0"
      }
      var receipt
      if(allowed) {
        const key = await getPublicKey()
        const keyHex = base64ToHex(key)
	if(referee === null) {
	  referee = "0x0000000000000000000000000000000000000000"
	}
	console.log("referee",referee)
        receipt = await chequeContract.setEncryptionPubkey("0x"+keyHex, referee, {gasPrice: gasPrice})
      } else {
        receipt = await chequeContract.unsetEncryptionPubkey({gasPrice: gasPrice})
      }
      console.log("receipt", receipt)
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
