<template>
  <h1>Write a Check on Blockchain</h1>
  <div class="normal">
    <p style="text-align: center"><img width="360" src="/favicon.svg"></p>
    <p>With this DApp, you can <a @click="read" href="">write a check</a> to a payee.</p>
    <p>This is a <a href="https://www.puredapp.org">Pure DApp</a>, which means its contract code and front-end code are both opensource and anyone can deploy them at anywhere.</p>
    <p v-if="allowed"><b>Currently, you have allowed checks sent to you.
    You can <button @click="refuse" href="">refuse</button> further incoming checks.</b></p>
    <p v-else><b>Currently, you have not allowed checks sent to you.
    You can <button @click="allow" href="">allow</button> incoming checks now.</b></p>
    <p>Together with the check, this DApp can send a memo encrypted with your public key, which can only be decrypted with the payee's private key, such that no other people can know the content.</p>
    <p>As an enhancement to the traditional paper check, you can add a passphrase or a hashtag to your check. After received a check with passphrase, the payee must enter the correct passphrase to get paid. You can send the passphrase to the payee with e-mail or IM Apps. A hashtag is just hints the usage of the check, and it does not require the payee to do anything. A hashtag begins with "#", and a passphrase does not.</p>
    <p><b>CAVEAT:</b> This is an opensource software. It is provided “as is”, without warranty of any kind. Please use it <b>AT YOUR OWN RISK</b>.</p>
    <!--
    <p><button @click="deployLogic">deployLogic</button></p>
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

async function getPublicKey() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const encryptionPublicKey = await window.ethereum.request({
    method: 'eth_getEncryptionPublicKey',
    params: [accounts[0]]
  })
  console.log(encryptionPublicKey)
  return encryptionPublicKey
}


async function switchAllow(allowed) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      //var gasPrice = await provider.getStorageAt("0x0000000000000000000000000000000000002710","0x00000000000000000000000000000000000000000000000000000000000000002")
      //if(gasPrice=="0x") {
      //  gasPrice = "0x0"
      //}
      if(allowed) {
        const key = await getPublicKey()
        const keyHex = base64ToHex(key)
	var referee = "0x0000000000000000000000000000000000000000"
        if(this.$route.params.has("refereeAddr") && this.$route.params.refereeAddr.length != 0) {
	  try {
	    referee = ethers.utils.getAddress(this.$route.params.refereeAddr)
	  } catch (e) {
	    alert(this.$route.params.refereeAddr+" is not an valid address for referee.")
	    return
	  }
        }
        await chequeContract.setEncryptionPubkey("0x"+keyHex, referee)
      } else {
        await chequeContract.unsetEncryptionPubkey()
      }
}
export default {
  name: 'Home',
  data() {
    return {
      allowed: false
    }
  },
  methods: {
    async deployLogic() {
      await deploy(window.chequeBytecode)
    },
    async allow() {
      switchAllow(true)
    },
    async refuse() {
      switchAllow(false)
    },
    read() {
      this.$router.push('read');
    },
    write() {
      this.$router.push('write');
    },
    passgen() {
      this.$router.push('passgen');
    } 
  },
  async mounted() {
    if (typeof window.ethereum === 'undefined') {
      alertNoWallet()
      return
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const myAddress = await signer.getAddress()
    const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
    const encPubkey = await chequeContract.encryptionPubkeys(myAddress)
    this.allowed = (encPubkey != 0)
    console.log(ethers.utils.base64.encode(encPubkey))
  }
}
</script>

