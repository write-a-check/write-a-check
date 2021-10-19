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
  "function acceptCheques(uint[] calldata idList, bytes calldata passphrase) external",
  "function refuseCheques(uint[] calldata idList) external",
  "function acceptCheque(uint id, bytes calldata passphrase) external",
  "function refuseCheque(uint id) external"]

window.chequeBytecode = "0x608060405234801561001057600080fd5b50613221806100206000396000f3fe6080604052600436106100c25760003560e01c80638e4e43a41161007f578063cd0b8bee11610059578063cd0b8bee14610252578063db8e23841461026e578063e37c3cb01461028a578063f7fdc6dd146102c7576100c2565b80638e4e43a4146101d7578063a15a890f14610200578063cbc1228d14610229576100c2565b8063163e7c62146100c757806335cb33db146100f0578063537739161461012d5780635faf22631461016e5780636653637f14610197578063876c07f4146101ae575b600080fd5b3480156100d357600080fd5b506100ee60048036038101906100e9919061237a565b6102f0565b005b3480156100fc57600080fd5b5061011760048036038101906101129190612067565b61034b565b6040516101249190612ae6565b60405180910390f35b34801561013957600080fd5b50610154600480360381019061014f919061237a565b610363565b604051610165959493929190612878565b60405180910390f35b34801561017a57600080fd5b506101956004803603810190610190919061227f565b6103a4565b005b3480156101a357600080fd5b506101ac610441565b005b3480156101ba57600080fd5b506101d560048036038101906101d0919061237a565b6104ca565b005b3480156101e357600080fd5b506101fe60048036038101906101f9919061227f565b61060e565b005b34801561020c57600080fd5b50610227600480360381019061022291906122cc565b610656565b005b34801561023557600080fd5b50610250600480360381019061024b9190612414565b6106e7565b005b61026c60048036038101906102679190612190565b61073c565b005b61028860048036038101906102839190612094565b610b5b565b005b34801561029657600080fd5b506102b160048036038101906102ac9190612143565b610e70565b6040516102be91906128cb565b60405180910390f35b3480156102d357600080fd5b506102ee60048036038101906102e991906123d4565b610f73565b005b6103488160008067ffffffffffffffff8111156103105761030f612efb565b5b6040519080825280601f01601f1916602001820160405280156103425781602001600182028036833780820191505090505b5061100a565b50565b60006020528060005260406000206000915090505481565b600080600080600080610375876112a5565b905080600001519550806020015194508060400151935080606001519250806080015191505091939590929450565b60008067ffffffffffffffff8111156103c0576103bf612efb565b5b6040519080825280601f01601f1916602001820160405280156103f25781602001600182028036833780820191505090505b50905060005b8383905081101561043b5761042884848381811061041957610418612ecc565b5b9050602002013560008461100a565b808061043390612e25565b9150506103f8565b50505050565b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff167f28f1a757c69b495383be7a1dfeb83d7d39c412913818674809b4fbac919e7aae60405160405180910390a2565b60006104d5826112a5565b90506000816060015167ffffffffffffffff161415610529576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161052090612a26565b60405180910390fd5b42816060015167ffffffffffffffff1610610579576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161057090612a06565b60405180910390fd5b61058282611533565b6105a78160000151826040015183602001516bffffffffffffffffffffffff166116f3565b806040015173ffffffffffffffffffffffffffffffffffffffff1682606084901c73ffffffffffffffffffffffffffffffffffffffff167f55282b3ab21725a5295da66b30787da30fca15979218d125e98dc4a9776d9f0760405160405180910390a45050565b60005b828290508110156106515761063e83838381811061063257610631612ecc565b5b905060200201356104ca565b808061064990612e25565b915050610611565b505050565b60005b848490508110156106e0576106cd85858381811061067a57610679612ecc565b5b90506020020135600185858080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061100a565b80806106d890612e25565b915050610659565b5050505050565b61073783600184848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061100a565b505050565b838390508989905014801561075657508181905089899050145b610795576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078c90612ac6565b60405180910390fd5b428567ffffffffffffffff16116107e1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107d890612aa6565b60405180910390fd5b6000866bffffffffffffffffffffffff16905061271160601b60601c73ffffffffffffffffffffffffffffffffffffffff168873ffffffffffffffffffffffffffffffffffffffff1614156108935789899050876bffffffffffffffffffffffff1661084d9190612ce1565b341461088e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161088590612a66565b60405180910390fd5b610abb565b600034146108d6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108cd90612a46565b60405180910390fd5b60008873ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161091191906127fd565b60206040518083038186803b15801561092957600080fd5b505afa15801561093d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061096191906123a7565b90508873ffffffffffffffffffffffffffffffffffffffff166323b872dd33308e8e90508c6bffffffffffffffffffffffff1661099e9190612ce1565b6040518463ffffffff1660e01b81526004016109bc93929190612818565b602060405180830381600087803b1580156109d657600080fd5b505af11580156109ea573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a0e919061234d565b5060008973ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401610a4a91906127fd565b60206040518083038186803b158015610a6257600080fd5b505afa158015610a76573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a9a91906123a7565b90508b8b90508282610aac9190612d3b565b610ab69190612cb0565b925050505b60005b8a8a9050811015610b4e57610b3b8b8b83818110610adf57610ade612ecc565b5b9050602002016020810190610af49190612067565b8a848a8a8a87818110610b0a57610b09612ecc565b5b90506020020135898988818110610b2457610b23612ecc565b5b9050602002810190610b369190612b86565b611838565b8080610b4690612e25565b915050610abe565b5050505050505050505050565b428467ffffffffffffffff1611610ba7576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b9e90612aa6565b60405180910390fd5b6000856bffffffffffffffffffffffff16905061271160601b60601c73ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff161415610c4b57856bffffffffffffffffffffffff163414610c46576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c3d90612a66565b60405180910390fd5b610e57565b60003414610c8e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c8590612a46565b60405180910390fd5b60008773ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401610cc991906127fd565b60206040518083038186803b158015610ce157600080fd5b505afa158015610cf5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d1991906123a7565b90508773ffffffffffffffffffffffffffffffffffffffff166323b872dd33308a6bffffffffffffffffffffffff166040518463ffffffff1660e01b8152600401610d6693929190612818565b602060405180830381600087803b158015610d8057600080fd5b505af1158015610d94573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610db8919061234d565b5060008873ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401610df491906127fd565b60206040518083038186803b158015610e0c57600080fd5b505afa158015610e20573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e4491906123a7565b90508181610e529190612d3b565b925050505b610e6688888388888888611838565b5050505050505050565b606060008383905067ffffffffffffffff811115610e9157610e90612efb565b5b604051908082528060200260200182016040528015610ebf5781602001602082028036833780820191505090505b50905060005b84849050811015610f6857600080868684818110610ee657610ee5612ecc565b5b9050602002016020810190610efb9190612067565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054828281518110610f4957610f48612ecc565b5b6020026020010181815250508080610f6090612e25565b915050610ec5565b508091505092915050565b816000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff167fca6ad40ddda258ce3df984c1c58b35dd1fa465dd19cbecba7346a98c7008453b8284604051610ffe92919061284f565b60405180910390a25050565b606083901c3360601b60601c73ffffffffffffffffffffffffffffffffffffffff161461106c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161106390612a86565b60405180910390fd5b6000611077846112a5565b90506000816060015167ffffffffffffffff1614156110cb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110c290612a26565b60405180910390fd5b806060015167ffffffffffffffff1642111561111c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611113906129e6565b60405180910390fd5b6000339050831561120d5760008260800151141580156111455750602360f88360800151901c14155b156111a95760008380519060200120905060088360800151901b60088260001c901b146111a7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161119e906129a6565b60405180910390fd5b505b816040015173ffffffffffffffffffffffffffffffffffffffff16853373ffffffffffffffffffffffffffffffffffffffff167f7c034fd89f31e2055d33b52660024ed09002226149a00e494a58472ef7f1ed7f60405160405180910390a4611274565b81604001519050816040015173ffffffffffffffffffffffffffffffffffffffff16853373ffffffffffffffffffffffffffffffffffffffff167fb92b62a11bbc0d8411fb5a2c72f4b0b51ea1b3df1849b2b6deca43a97a8bdd4260405160405180910390a45b61127d85611533565b61129e82600001518284602001516bffffffffffffffffffffffff166116f3565b5050505050565b6112ad611e1e565b6000826040516020016112c09190612ae6565b604051602081830303815290604052905060008061271260601b60601c73ffffffffffffffffffffffffffffffffffffffff168360405160240161130491906128ed565b6040516020818303038152906040527fd6d7d525000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161138e91906127e6565b600060405180830381855af49150503d80600081146113c9576040519150601f19603f3d011682016040523d82523d6000602084013e6113ce565b606091505b50915091508180156113ed57506040815114806113ec575060a08151145b5b6113f657600080fd5b604081511415611429576000846060019067ffffffffffffffff16908167ffffffffffffffff168152505050505061152e565b606060408201905060008060008380602001905181019061144a9190612474565b925092509250606083901c60601b60601c886000019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff16815250508288602001906bffffffffffffffffffffffff1690816bffffffffffffffffffffffff1681525050604082901c60601b60601c886040019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff168152505081886060019067ffffffffffffffff16908167ffffffffffffffff168152505080886080018181525050505050505050505b919050565b6000816040516020016115469190612ae6565b604051602081830303815290604052905060008067ffffffffffffffff81111561157357611572612efb565b5b6040519080825280601f01601f1916602001820160405280156115a55781602001600182028036833780820191505090505b50905060008061271260601b60601c73ffffffffffffffffffffffffffffffffffffffff1684846040516024016115dd92919061290f565b6040516020818303038152906040527fa18c751e000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161166791906127e6565b600060405180830381855af49150503d80600081146116a2576040519150601f19603f3d011682016040523d82523d6000602084013e6116a7565b606091505b5091509150816116ec576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016116e390612966565b60405180910390fd5b5050505050565b6000808473ffffffffffffffffffffffffffffffffffffffff16848460405160240161172092919061284f565b6040516020818303038152906040527fa9059cbb000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516117aa91906127e6565b6000604051808303816000865af19150503d80600081146117e7576040519150601f19603f3d011682016040523d82523d6000602084013e6117ec565b606091505b509150915081611831576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611828906129c6565b60405180910390fd5b5050505050565b62278d00426118479190612c5a565b8467ffffffffffffffff1610611892576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161188990612986565b60405180910390fd5b60003360601b60601c73ffffffffffffffffffffffffffffffffffffffff169050600060088262ffffff16901b602043901b60608b60601b60601c73ffffffffffffffffffffffffffffffffffffffff16901b171790505b6118f381611aa5565b1561190b57808061190390612e25565b9150506118ea565b611913611e1e565b33816040019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff168152505086816060019067ffffffffffffffff16908167ffffffffffffffff168152505088816000019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff1681525050858160800181815250508781602001906bffffffffffffffffffffffff1690816bffffffffffffffffffffffff16815250506119df8282611bfe565b6000886bffffffffffffffffffffffff1660608b60601b60601c73ffffffffffffffffffffffffffffffffffffffff16901b17905060008867ffffffffffffffff16604042901b1790503373ffffffffffffffffffffffffffffffffffffffff16848d73ffffffffffffffffffffffffffffffffffffffff167f5a8039e362c5082b85db686c7a1ba5274e97d4bf7af46f352f3fcb60d9b3903e85858d8d8d604051611a8f959493929190612b38565b60405180910390a4505050505050505050505050565b60008082604051602001611ab99190612ae6565b604051602081830303815290604052905060008061271260601b60601c73ffffffffffffffffffffffffffffffffffffffff1683604051602401611afd91906128ed565b6040516020818303038152906040527fd6d7d525000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051611b8791906127e6565b600060405180830381855af49150503d8060008114611bc2576040519150601f19603f3d011682016040523d82523d6000602084013e611bc7565b606091505b5091509150818015611be65750604081511480611be5575060a08151145b5b611bef57600080fd5b60a08151149350505050919050565b600082604051602001611c119190612ae6565b604051602081830303815290604052905060008060008091509150836000015160601b60601c73ffffffffffffffffffffffffffffffffffffffff16915083602001516bffffffffffffffffffffffff16606083901b179150836040015160601b60601c73ffffffffffffffffffffffffffffffffffffffff169050836060015167ffffffffffffffff16604082901b179050600082828660800151604051602001611cbf93929190612b01565b604051602081830303815290604052905060008061271260601b60601c73ffffffffffffffffffffffffffffffffffffffff168684604051602401611d0592919061290f565b6040516020818303038152906040527fa18c751e000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051611d8f91906127e6565b600060405180830381855af49150503d8060008114611dca576040519150601f19603f3d011682016040523d82523d6000602084013e611dcf565b606091505b509150915081611e14576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611e0b90612946565b60405180910390fd5b5050505050505050565b6040518060a00160405280600073ffffffffffffffffffffffffffffffffffffffff16815260200160006bffffffffffffffffffffffff168152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600067ffffffffffffffff168152602001600081525090565b600081359050611ea081613178565b92915050565b60008083601f840112611ebc57611ebb612f2f565b5b8235905067ffffffffffffffff811115611ed957611ed8612f2a565b5b602083019150836020820283011115611ef557611ef4612f3e565b5b9250929050565b60008083601f840112611f1257611f11612f2f565b5b8235905067ffffffffffffffff811115611f2f57611f2e612f2a565b5b602083019150836020820283011115611f4b57611f4a612f3e565b5b9250929050565b60008083601f840112611f6857611f67612f2f565b5b8235905067ffffffffffffffff811115611f8557611f84612f2a565b5b602083019150836020820283011115611fa157611fa0612f3e565b5b9250929050565b600081519050611fb78161318f565b92915050565b60008083601f840112611fd357611fd2612f2f565b5b8235905067ffffffffffffffff811115611ff057611fef612f2a565b5b60208301915083600182028301111561200c5761200b612f3e565b5b9250929050565b600081359050612022816131a6565b92915050565b600081519050612037816131a6565b92915050565b60008135905061204c816131bd565b92915050565b600081359050612061816131d4565b92915050565b60006020828403121561207d5761207c612f4d565b5b600061208b84828501611e91565b91505092915050565b600080600080600080600060c0888a0312156120b3576120b2612f4d565b5b60006120c18a828b01611e91565b97505060206120d28a828b01611e91565b96505060406120e38a828b01612052565b95505060606120f48a828b0161203d565b94505060806121058a828b01612013565b93505060a088013567ffffffffffffffff81111561212657612125612f48565b5b6121328a828b01611fbd565b925092505092959891949750929550565b6000806020838503121561215a57612159612f4d565b5b600083013567ffffffffffffffff81111561217857612177612f48565b5b61218485828601611ea6565b92509250509250929050565b600080600080600080600080600060c08a8c0312156121b2576121b1612f4d565b5b60008a013567ffffffffffffffff8111156121d0576121cf612f48565b5b6121dc8c828d01611ea6565b995099505060206121ef8c828d01611e91565b97505060406122008c828d01612052565b96505060606122118c828d0161203d565b95505060808a013567ffffffffffffffff81111561223257612231612f48565b5b61223e8c828d01611f52565b945094505060a08a013567ffffffffffffffff81111561226157612260612f48565b5b61226d8c828d01611efc565b92509250509295985092959850929598565b6000806020838503121561229657612295612f4d565b5b600083013567ffffffffffffffff8111156122b4576122b3612f48565b5b6122c085828601611f52565b92509250509250929050565b600080600080604085870312156122e6576122e5612f4d565b5b600085013567ffffffffffffffff81111561230457612303612f48565b5b61231087828801611f52565b9450945050602085013567ffffffffffffffff81111561233357612332612f48565b5b61233f87828801611fbd565b925092505092959194509250565b60006020828403121561236357612362612f4d565b5b600061237184828501611fa8565b91505092915050565b6000602082840312156123905761238f612f4d565b5b600061239e84828501612013565b91505092915050565b6000602082840312156123bd576123bc612f4d565b5b60006123cb84828501612028565b91505092915050565b600080604083850312156123eb576123ea612f4d565b5b60006123f985828601612013565b925050602061240a85828601611e91565b9150509250929050565b60008060006040848603121561242d5761242c612f4d565b5b600061243b86828701612013565b935050602084013567ffffffffffffffff81111561245c5761245b612f48565b5b61246886828701611fbd565b92509250509250925092565b60008060006060848603121561248d5761248c612f4d565b5b600061249b86828701612028565b93505060206124ac86828701612028565b92505060406124bd86828701612028565b9150509250925092565b60006124d383836127aa565b60208301905092915050565b6124e881612d6f565b82525050565b60006124f982612bf9565b6125038185612c1c565b935061250e83612be9565b8060005b8381101561253f57815161252688826124c7565b975061253183612c0f565b925050600181019050612512565b5085935050505092915050565b60006125588385612c2d565b9350612565838584612de3565b61256e83612f52565b840190509392505050565b600061258482612c04565b61258e8185612c2d565b935061259e818560208601612df2565b6125a781612f52565b840191505092915050565b60006125bd82612c04565b6125c78185612c3e565b93506125d7818560208601612df2565b80840191505092915050565b60006125f0600f83612c49565b91506125fb82612f63565b602082019050919050565b6000612613600f83612c49565b915061261e82612f8c565b602082019050919050565b6000612636601a83612c49565b915061264182612fb5565b602082019050919050565b6000612659601083612c49565b915061266482612fde565b602082019050919050565b600061267c601483612c49565b915061268782613007565b602082019050919050565b600061269f600e83612c49565b91506126aa82613030565b602082019050919050565b60006126c2601583612c49565b91506126cd82613059565b602082019050919050565b60006126e5601183612c49565b91506126f082613082565b602082019050919050565b6000612708600d83612c49565b9150612713826130ab565b602082019050919050565b600061272b600e83612c49565b9150612736826130d4565b602082019050919050565b600061274e600983612c49565b9150612759826130fd565b602082019050919050565b6000612771601083612c49565b915061277c82613126565b602082019050919050565b6000612794600f83612c49565b915061279f8261314f565b602082019050919050565b6127b381612dad565b82525050565b6127c281612dad565b82525050565b6127d181612db7565b82525050565b6127e081612dcb565b82525050565b60006127f282846125b2565b915081905092915050565b600060208201905061281260008301846124df565b92915050565b600060608201905061282d60008301866124df565b61283a60208301856124df565b61284760408301846127b9565b949350505050565b600060408201905061286460008301856124df565b61287160208301846127b9565b9392505050565b600060a08201905061288d60008301886124df565b61289a60208301876127d7565b6128a760408301866124df565b6128b460608301856127c8565b6128c160808301846127b9565b9695505050505050565b600060208201905081810360008301526128e581846124ee565b905092915050565b600060208201905081810360008301526129078184612579565b905092915050565b600060408201905081810360008301526129298185612579565b9050818103602083015261293d8184612579565b90509392505050565b6000602082019050818103600083015261295f816125e3565b9050919050565b6000602082019050818103600083015261297f81612606565b9050919050565b6000602082019050818103600083015261299f81612629565b9050919050565b600060208201905081810360008301526129bf8161264c565b9050919050565b600060208201905081810360008301526129df8161266f565b9050919050565b600060208201905081810360008301526129ff81612692565b9050919050565b60006020820190508181036000830152612a1f816126b5565b9050919050565b60006020820190508181036000830152612a3f816126d8565b9050919050565b60006020820190508181036000830152612a5f816126fb565b9050919050565b60006020820190508181036000830152612a7f8161271e565b9050919050565b60006020820190508181036000830152612a9f81612741565b9050919050565b60006020820190508181036000830152612abf81612764565b9050919050565b60006020820190508181036000830152612adf81612787565b9050919050565b6000602082019050612afb60008301846127b9565b92915050565b6000606082019050612b1660008301866127b9565b612b2360208301856127b9565b612b3060408301846127b9565b949350505050565b6000608082019050612b4d60008301886127b9565b612b5a60208301876127b9565b612b6760408301866127b9565b8181036060830152612b7a81848661254c565b90509695505050505050565b60008083356001602003843603038112612ba357612ba2612f39565b5b80840192508235915067ffffffffffffffff821115612bc557612bc4612f34565b5b602083019250600182023603831315612be157612be0612f43565b5b509250929050565b6000819050602082019050919050565b600081519050919050565b600081519050919050565b6000602082019050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b600082825260208201905092915050565b6000612c6582612dad565b9150612c7083612dad565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115612ca557612ca4612e6e565b5b828201905092915050565b6000612cbb82612dad565b9150612cc683612dad565b925082612cd657612cd5612e9d565b5b828204905092915050565b6000612cec82612dad565b9150612cf783612dad565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615612d3057612d2f612e6e565b5b828202905092915050565b6000612d4682612dad565b9150612d5183612dad565b925082821015612d6457612d63612e6e565b5b828203905092915050565b6000612d7a82612d8d565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600067ffffffffffffffff82169050919050565b60006bffffffffffffffffffffffff82169050919050565b82818337600083830152505050565b60005b83811015612e10578082015181840152602081019050612df5565b83811115612e1f576000848401525b50505050565b6000612e3082612dad565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612e6357612e62612e6e565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f5345503130315f5345545f4641494c0000000000000000000000000000000000600082015250565b7f5345503130315f44454c5f4641494c0000000000000000000000000000000000600082015250565b7f646561646c696e652d6d7573742d696e2d6f6e652d6d6f6e7468000000000000600082015250565b7f77726f6e672d7061737370687261736500000000000000000000000000000000600082015250565b7f5345503230365f5452414e534645525f4641494c000000000000000000000000600082015250565b7f61667465722d646561646c696e65000000000000000000000000000000000000600082015250565b7f7374696c6c2d6265666f72652d646561646c696e650000000000000000000000600082015250565b7f6368657175652d6e6f742d657869737473000000000000000000000000000000600082015250565b7f646f6e742d73656e642d62636800000000000000000000000000000000000000600082015250565b7f76616c75652d6d69736d61746368000000000000000000000000000000000000600082015250565b7f6e6f742d70617965650000000000000000000000000000000000000000000000600082015250565b7f696e76616c69642d646561646c696e6500000000000000000000000000000000600082015250565b7f6c656e6774682d6d69736d617463680000000000000000000000000000000000600082015250565b61318181612d6f565b811461318c57600080fd5b50565b61319881612d81565b81146131a357600080fd5b50565b6131af81612dad565b81146131ba57600080fd5b50565b6131c681612db7565b81146131d157600080fd5b50565b6131dd81612dcb565b81146131e857600080fd5b5056fea2646970667358221220ad409e105f77566e0ad51f541f1ba89ea66dec727265f8f3846d4cbd45bec9aa64736f6c63430008060033"
	
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

window.ChequeContractAddress = "0xa36C479eEAa25C0CFC7e099D3bEbF7A7F1303F40"
//window.ChequeContractAddress = "0xa29eF06fb43Ac4f61E2cC9446089B0A829124237"//testnet 

window.alertNoWallet = () => {
      alert("No wallet installed! Please install MetaMask or other web3 wallet to use this App.");
}

window.connectWallet = async function() {
   if (typeof window.ethereum === 'undefined') {
      if (typeof window.web3 !== 'undefined') {
          window.ethereum = window.web3
      } else if (typeof window.TPJSBrigeClient !== 'undefined') {
          window.ethereum = window.TPJSBrigeClient
      } else if (typeof window.imToken !== 'undefined') {
          window.ethereum = window.imToken
      } else {
          const provider = await detectEthereumProvider()
          if (provider) {
              window.ethereum = provider
          } else {
              alertNoWallet()
	      return false
          }
      }
   } else {
      await ethereum.request({ method: 'eth_requestAccounts' })
   }
   return true
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

window.strToHex = function(s) {
  const encoder = new TextEncoder()
  const encData = encoder.encode(s)
  return uint8ArrayToHex(encData)
}

window.strToBytes32Hex = function(s) {
  const hex = strToHex(s)
  return "0x"+hex+("0".repeat(Math.max(0, 64-hex.length)))
}

window.uint8ArrayFromHex = function(s) {
  var u8arr = new Uint8Array(Math.ceil(s.length / 2)-1);
  var end = u8arr.length
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

window.hexToReferID = function(hex) {
  var res = ""
  const table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"
  for (var i = 0; i < hex.length; i+=2) {
    const n = parseInt(hex.substr(i, 2), 16)
    if(isNaN(n)) {return null}
    res += table[n%64]
  }
  return res
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

window.encryptMsgWithKeyWrap = function(msg, encryptionPublicKey) {
  if(encryptionPublicKey.length == 0) { // no encryption
    return "0x0000"+strToHex(msg) //nonce.length and ephemPublicKey.length are both zero
  } else {
    return encryptMsgWithKey(msg, encryptionPublicKey)
  }
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
  if(memoLength != 0) {
    const memo = "0x"+data.substr(2+64*5, memoLength*2) //skip memo's offset and length
    if(memo.startsWith("0x0000")) {
      cheque.clearTextMemo = strFromHex("0x"+memo.substr(6))
    } else {
      cheque.encryptedMemo = memo
    }
  }
  cheque.coinType = ethers.utils.getAddress("0x"+coinTypeAndAmount.substr(0, 20*2))
  cheque.coinURL = "https://www.smartscan.cash/address/"+cheque.coinType
  const [symbol, decimals] = await getCoinSymbolAndDecimals(coinInfoMap, cheque.coinType)
  cheque.coinSymbol = symbol
  const amt = ethers.BigNumber.from("0x"+coinTypeAndAmount.substr(20*2, 12*2))
  cheque.amount = ethers.utils.formatUnits(amt, decimals)
  cheque.startTime = ethers.BigNumber.from("0x"+startAndEndTime.substr(16*2, 8*2)).toNumber()
  cheque.deadline = ethers.BigNumber.from("0x"+startAndEndTime.substr(24*2, 8*2)).toNumber()
  cheque.startTimeStr = timestamp2string(cheque.startTime*1000)
  cheque.deadlineStr = timestamp2string(cheque.deadline*1000)
  var totalSec = cheque.deadline - Math.floor(Date.now()/1000)
  if(totalSec > 0) {
    const dayCount = Math.floor(totalSec/(24*3600.0))
    const hourCount = Math.floor((totalSec-dayCount*24*3600.0)/3600.0)
    const minuteCount = Math.floor((totalSec-dayCount*24*3600.0-hourCount*3600.0)/60.0)
    cheque.remainTime = ""
    if(dayCount > 0) {cheque.remainTime += dayCount+(dayCount==1 ? " Day " : " Days ")}
    if(hourCount > 0) {cheque.remainTime += hourCount+(hourCount==1 ? " Hour " : " Hours ")}
    if(dayCount == 0 && minuteCount > 0) {
      cheque.remainTime += minuteCount+(minuteCount==1 ? " Minute" : " Minutes")
    }
  }
  cheque.hasTag = cheque.passphraseHash.substr(2,2) == "23" // 0x23 is '#'
  cheque.hasPassphrase = !(ethers.BigNumber.from(cheque.passphraseHash).isZero() || cheque.hasTag)
  if(cheque.hasPassphrase) {
    cheque.salt = cheque.deadline.toString()+" "+cheque.payee.substr(2)+" "
  }
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
  try {
    const encryptionPublicKey = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [accounts[0]]
    })
    return encryptionPublicKey
  } catch(e) {
    return null
  }
}

window.switchAllow = async function(allowed, referee = null) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      var receipt
      if(allowed) {
        const key = await getPublicKey()
        if(key === null) {
	  alert("Sorry, your wallet does not support encrypt&decrypt API")
	  return
	}
        const keyHex = base64ToHex(key)
	if(referee === null) {
	  referee = "0x0000000000000000000000000000000000000000"
	}
	console.log("referee",referee)
        receipt = await chequeContract.setEncryptionPubkey("0x"+keyHex, referee)
      } else {
        receipt = await chequeContract.unsetEncryptionPubkey()
      }
      console.log("receipt", receipt)
}

window.NewCheque = ethers.utils.id("NewCheque(address,uint256,address,uint256,uint256,uint256,bytes)")
window.RevokeCheque = ethers.utils.id("RevokeCheque(address,uint256,address)")
window.AcceptCheque = ethers.utils.id("AcceptCheque(address,uint256,address)")
window.RefuseCheque = ethers.utils.id("RefuseCheque(address,uint256,address)")
// const SetEncryptionPubkey = ethers.utils.id("SetEncryptionPubkey(address,address,uint256)")
// const UnsetEncryptionPubkey = ethers.utils.id("UnsetEncryptionPubkey(address)")

function IsPC() {
       var userAgentInfo = navigator.userAgent;
       var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
       var flag = true;
       for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
             }
       }
       return flag;
}

if(IsPC()) {
   document.getElementById("app").style.zoom = 1.1
}

createApp(App).use(router).mount('#app')

// Account1: 0x5637c9fbFf9FAf5f534d0a88199feCD97357635B
// Account2: 0xd6c5F62c58238bfF1210b53ED5d1b2224EBC5176
// Account3: 0x732B170AB666146ea3752c81b27E85d215EEb190
// ABC: 0xc0afb01d2c33c8b8c7674e2647d838c12b135f74
// XYZ: 0x2021bf6D0C13554E1A1feF1BD0C064315421bDc7
