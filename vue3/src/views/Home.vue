<template>
  <div class="normal">
    <p style="text-align: center"><img width="360" src="/favicon.svg"></p>
    <p>You can learn more about blockchain cheques on <a href="https://www.checkbook.cash/">www.checkbook.cash</a>, especially the blogs on its <a href="https://www.checkbook.cash/posts/hello-world-from-blockchain-cheques">basic</a> and <a href="https://www.checkbook.cash/posts/other-usages-of-blockchain-cheques">extended</a> use cases.</p>
    <p>With this DApp, you can <a @click.stop.prevent="write" href="">write a check</a> to a payee, or <a @click.stop.prevent="revoke" href="">revoke expired checks</a> sent by you. You can also <a @click.stop.prevent="receive" href="">receive checks</a> sent to you.</p>
    <p v-if="allowed"><b>Currently, you have enabled memo-encryption.
    You can <button @click="refuse" href="">disable</button> memo-encryption now.</b></p>
    <p v-else><b>Currently, you have not enabled memo-encryption and all the memos to you must be clear text.
    You can <button @click="allow" href="">enable</button> memo-encryption now, if you are using MetaMask extension in a browser.</b></p>
    <p v-show="myAddress">Your current account is<br>${{myAddress}}.</p>
    <p v-show="referLink">Your refer link is<br><a :href="referLink"><code style="color: blue;">{{referLink}}</code></a></p>
    <p v-show="myAddress && !referLink">You do not have a refer link, because your account never sent any transactions.</p>
    <hr>
    <p>Why do we design such a DApp? Because we believe some features of paper checks can be borrowed to enrich the methods for airdropping. First of all, here is a Notification Center of airdrops. There are so many SEP20 tokens, and when somebody send you an unknown token, you are not even aware of that! However, if all the airdropped tokens are sent through cheques, you can find them all here.</p>
    <p>Second, cheques have deadlines. The payees must accept the cheques before the deadline, or the cheques can be revoked by the payer. If the payees are not interested, the payer can take back the tokens in expired cheques. Thus, no tokens are wasted.</p>
    <p>Last but not least, cheques enables more communications. A tag with clear text (non-encrypted) can be attached to a cheque, explaining the reason of airdrop. If the payee's wallet support encryption (currently only MetaMask browser extension supports it), you can also send memos to her. Unlike tags, memos have no length limit, and can be encrypted for privacy. Using memos, you can guide a payee to try some DApps for further airdrop.</p>
    <p>You can also require the payee to enter a predefined secret tag when accepting a cheque. To figure out what the secret tag is, the payee must follow the memo's guide, reading some document, receiving some e-mail, or chatting with some telegram robot. Thus you can buy the payee's attention with some tokens.</p>
    <p>We believe all these features are useful, so implement them in this DApp. This DApp does not charge you anything. It is a free tool as part of smartBCH's infrastructure. Hope you like it!</p>
    <p>This is a <a href="https://www.puredapp.org">Pure DApp</a>, which means its contract code and front-end code are both opensource and anyone can deploy them at anywhere.</p>
    <p><b>CAVEAT:</b> This is an opensource software. It is provided “as is”, without warranty of any kind. Please use it <b>AT YOUR OWN RISK</b>.</p>
    <p><button @click="showReferID">Show Refer ID</button></p>
    <!--
    <p><button @click="deployLogic">deployLogic</button></p>
    <p><button @click="deploySimpleToken">deploySimpleToken</button></p>
    -->
  </div>
</template>

<script>

async function deploy(bytecode) {
  const abi = [ "constructor() public" ];
  
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  try {
    const signer = provider.getSigner()
    const factory = new ethers.ContractFactory(abi, bytecode, signer)
    const contract = await factory.deploy();
    console.log("address:", contract.address)
    const receipt = await contract.deployTransaction.wait();
    console.log(receipt)
  } catch(e) {
    alert("Error! "+e.toString())
  }
}

async function deploySimpleToken() {
  const bytecode = "0x60a06040523480156200001157600080fd5b5060405162000c5638038062000c56833981016040819052620000349162000203565b835162000049906003906020870190620000a6565b5082516200005f906004906020860190620000a6565b5060f81b7fff000000000000000000000000000000000000000000000000000000000000001660805260028190553360009081526020819052604090205550620002e39050565b828054620000b49062000290565b90600052602060002090601f016020900481019282620000d8576000855562000123565b82601f10620000f357805160ff191683800117855562000123565b8280016001018555821562000123579182015b828111156200012357825182559160200191906001019062000106565b506200013192915062000135565b5090565b5b8082111562000131576000815560010162000136565b600082601f8301126200015e57600080fd5b81516001600160401b03808211156200017b576200017b620002cd565b604051601f8301601f19908116603f01168101908282118183101715620001a657620001a6620002cd565b81604052838152602092508683858801011115620001c357600080fd5b600091505b83821015620001e75785820183015181830184015290820190620001c8565b83821115620001f95760008385830101525b9695505050505050565b600080600080608085870312156200021a57600080fd5b84516001600160401b03808211156200023257600080fd5b62000240888389016200014c565b955060208701519150808211156200025757600080fd5b5062000266878288016200014c565b93505060408501519150606085015160ff811681146200028557600080fd5b939692955090935050565b600181811c90821680620002a557607f821691505b60208210811415620002c757634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b60805160f81c61095462000302600039600061014101526109546000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c806342966c681161008c57806395d89b411161006657806395d89b41146101cf578063a457c2d7146101d7578063a9059cbb146101ea578063dd62ed3e146101fd57600080fd5b806342966c681461017e57806370a082311461019357806379cc6790146101bc57600080fd5b806306fdde03146100d4578063095ea7b3146100f257806318160ddd1461011557806323b872dd14610127578063313ce5671461013a578063395093511461016b575b600080fd5b6100dc610236565b6040516100e99190610849565b60405180910390f35b610105610100366004610806565b6102c4565b60405190151581526020016100e9565b6002545b6040519081526020016100e9565b6101056101353660046107ca565b6102da565b60405160ff7f00000000000000000000000000000000000000000000000000000000000000001681526020016100e9565b610105610179366004610806565b61032c565b61019161018c366004610830565b610363565b005b6101196101a1366004610775565b6001600160a01b031660009081526020819052604090205490565b6101916101ca366004610806565b610370565b6100dc6103bb565b6101056101e5366004610806565b6103c8565b6101056101f8366004610806565b6103ff565b61011961020b366004610797565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b60038054610243906108cd565b80601f016020809104026020016040519081016040528092919081815260200182805461026f906108cd565b80156102bc5780601f10610291576101008083540402835291602001916102bc565b820191906000526020600020905b81548152906001019060200180831161029f57829003601f168201915b505050505081565b60006102d133848461040c565b50600192915050565b60006102e784848461051f565b6001600160a01b03841660009081526001602090815260408083203380855292529091205461032291869161031d9086906108b6565b61040c565b5060019392505050565b3360008181526001602090815260408083206001600160a01b038716845290915281205490916102d191859061031d90869061089e565b61036d3382610670565b50565b6001600160a01b038216600090815260016020908152604080832033845290915281205461039f9083906108b6565b90506103ac83338361040c565b6103b68383610670565b505050565b60048054610243906108cd565b3360008181526001602090815260408083206001600160a01b038716845290915281205490916102d191859061031d9086906108b6565b60006102d133848461051f565b6001600160a01b0383166104675760405162461bcd60e51b815260206004820152601d60248201527f415050524f56455f46524f4d5f5448455f5a45524f5f4144445245535300000060448201526064015b60405180910390fd5b6001600160a01b0382166104bd5760405162461bcd60e51b815260206004820152601b60248201527f415050524f56455f544f5f5448455f5a45524f5f414444524553530000000000604482015260640161045e565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b6001600160a01b0383166105755760405162461bcd60e51b815260206004820152601e60248201527f5452414e534645525f46524f4d5f5448455f5a45524f5f414444524553530000604482015260640161045e565b6001600160a01b0382166105cb5760405162461bcd60e51b815260206004820152601c60248201527f5452414e534645525f544f5f5448455f5a45524f5f4144445245535300000000604482015260640161045e565b6001600160a01b0383166000908152602081905260409020546105ef9082906108b6565b6001600160a01b03808516600090815260208190526040808220939093559084168152205461061f90829061089e565b6001600160a01b038381166000818152602081815260409182902094909455518481529092918616917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9101610512565b6001600160a01b0382166106c65760405162461bcd60e51b815260206004820152601a60248201527f4255524e5f46524f4d5f5448455f5a45524f5f41444452455353000000000000604482015260640161045e565b6001600160a01b0382166000908152602081905260409020546106ea9082906108b6565b6001600160a01b0383166000908152602081905260409020556002546107119082906108b6565b6002556040518181526000906001600160a01b038416907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b80356001600160a01b038116811461077057600080fd5b919050565b60006020828403121561078757600080fd5b61079082610759565b9392505050565b600080604083850312156107aa57600080fd5b6107b383610759565b91506107c160208401610759565b90509250929050565b6000806000606084860312156107df57600080fd5b6107e884610759565b92506107f660208501610759565b9150604084013590509250925092565b6000806040838503121561081957600080fd5b61082283610759565b946020939093013593505050565b60006020828403121561084257600080fd5b5035919050565b600060208083528351808285015260005b818110156108765785810183015185820160400152820161085a565b81811115610888576000604083870101525b50601f01601f1916929092016040019392505050565b600082198211156108b1576108b1610908565b500190565b6000828210156108c8576108c8610908565b500390565b600181811c908216806108e157607f821691505b6020821081141561090257634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fdfea2646970667358221220cd43c15b4d9a07101fe1eed3b992809b60d012e163756e363c7288d47b84675a64736f6c63430008060033"
  const abi = ["constructor (string memory name_, string memory symbol_, uint256 supply, uint8 decimals_)"];
  
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  try {
    const signer = provider.getSigner()
    const factory = new ethers.ContractFactory(abi, bytecode, signer)
    const supply = ethers.utils.parseUnits("21000000", 18)
    const contract = await factory.deploy("ABC Coin", "ABC", supply, 18);
    console.log("address:", contract.address)
    const receipt = await contract.deployTransaction.wait();
    console.log(receipt)
  } catch(e) {
    alert("Error! "+e.toString())
  }
}

export default {
  name: 'Home',
  data() {
    return {
      myAddress: null,
      referLink: null,
      allowed: false
    }
  },
  methods: {
    showReferID() {
      alert(localStorage.getItem("referID"))
    },
    async deployLogic() {
      await deploy(window.chequeBytecode)
    },
    async deploySimpleToken() {
      await deploySimpleToken()
    },
    async allow() {
      var referID = "0x0000000000000000000000000000000000000000"
      const storedReferee = localStorage.getItem("referID")
      if(storedReferee !== null) {
        referID = storedReferee
      }
      switchAllow(true, referID)
    },
    async refuse() {
      switchAllow(false)
    },
    write() {
      this.$router.push('write');
    },
    receive() {
      this.$router.push('receive');
    },
    revoke() {
      this.$router.push('revoke');
    } 
  },
  async mounted() {
    if(!connectWallet()) {
      return
    }
    if(this.$route.query.r && localStorage.getItem("referID") === null) {
      localStorage.setItem("referID", this.$route.query.r)
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    this.myAddress = await signer.getAddress()
    const nonce = await provider.getTransactionCount(this.myAddress)
    if(nonce != 0) {
      this.referLink = "https://app.checkbook.cash/?r="+hexToReferID(this.myAddress.substr(2,22))
    }
    const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
    try {
      const encPubkey = await chequeContract.encryptionPubkeys(this.myAddress)
      this.allowed = (encPubkey != 0)
    } catch(e) {
      console.log(e)
    }
  }
}
</script>

