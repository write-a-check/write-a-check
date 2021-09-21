<template>
  <div class="normal">
   <table style="margin: auto; border-spacing: 15px;">
   <tr><td><b>Token's Address or Symbol</b><br/>
   (Click <button @click="useBCH">here</button> if sending BCH)</td>
   <td><input v-model="sep20Address" type="text" placeholder="Please enter an SEP20 token's address or symbol"></td></tr>
   <tr><td><b>Payees' Addresses</b><br/>You can also paste any text in the right text area, and
   click <button @click="extract">extract</button> to extract addresses from it.</td>
   <td><textarea v-model="addressList" placeholder="Please enter addresses in HEX format. One address in a line" rows="6" cols="40"></textarea></td></tr>
   <tr><td><b>Amount Sent to Each Payee</b></td>
   <td><input v-model="amount" type="number" placeholder="Please enter a number"></td></tr>
   <tr><td><b>Deadline</b></td>
   <td><input v-model="deadline" type="datetime-local"></td></tr>
   <tr><td><b>Passphrase or Hashtag</b><br/>
   (A hashtag begins with "#", and a passphrase does not)</td>
   <td><input v-model="passphrase" type="text"
   placeholder="Leave here black if passphrase or hashtag isn't needed"></td></tr>
   <tr><td><b>Memo</b><br/>
   (It will be encrypted by the payee's public key and only the payee can decrypt)</td>
   <td><textarea v-model="memo" placeholder="Please enter some text to explain what is the purpose of this check." rows="10" cols="40"></textarea></td></tr>
   </table>
   <div style="margin: auto; width: 40%"><br/>
   <button @click="submit" style="font-size: 24px; width: 300px">Submit</button></div>
  </div>
</template>

<style>
textarea, input {
    font-size:20px;
    width: 560px;
}
p {
    text-align: center;
}
button {
    font-size:20px;
}
</style>

<script>
function genRand() {
      var arr = new Uint8Array(12)
      window.crypto.getRandomValues(arr)
      return ethers.utils.base64.encode(arr)
}

function extractAddrList(text, sep20Address) {
  var entries = text.split("0x")
  var addrSet = {}
  for(let entry of entries) {
    if(entry.length < 40) {
      continue
    }
    try {
      const addr = ethers.utils.getAddress("0x"+entry.substr(0,40))
      addrSet[addr] = true
    } catch(e) {
      console.log(e)
    }
  }
  delete addrSet[sep20Address]
  var coins = Object.keys(addrSet)
  coins.sort()
  return coins.join("\n")
}

export default {
  data() {
    return {
      sep20Address: "",
      payeeAddress: "",
      amount: 0,
      passphrase: "",
      deadline: "",
      addressList: [],
      memo: ""
    }
  },
  methods: {
    extract() {
       this.addressList = extractAddrList(this.addressList, this.sep20Address)
    },
    useBCH() {
       this.sep20Address = "0x0000000000000000000000000000000000002711"
    },
    async submit() {
      if (typeof window.ethereum === 'undefined') {
        alertNoWallet()
        return
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)

      var payeeList = [];
      var encPubkeyList = [];
      const addressList = this.addressList.split("\n")
      for(var i=0; i<addressList.length; i++) {
        try {
          const payee = ethers.utils.getAddress(addressList[i].trim())
          const encPubkey = await chequeContract.encryptionPubkeys(payee)
          if(encPubkey == 0) {
            alert("The payee "+payee+" is refusing checks. Will ignore it.")
          } else {
	    payeeList.push(payee)
            encPubkeyList.push(ethers.utils.base64.encode(encPubkey))
	  }
        } catch(e) {
          alert("Invalid Payee's Address: "+addressList[i])
          return
        }
      }

      const [coinType, symbol] = await getSEP20AddrAndSymbol(this.sep20Address)
      if(coinType === null) {
        return
      }

      var balance, decimals, allowance;
      const sep20Contract = new ethers.Contract(coinType, SEP20ABI, provider)
      try {
	const balanceAmt = await sep20Contract.balanceOf(signer.getAddress())
	const allowanceAmt = await sep20Contract.allowance(signer.getAddress(), ChequeContractAddress)
        decimals = await sep20Contract.decimals()
        balance = ethers.utils.formatUnits(balanceAmt, decimals)
	allowance = ethers.utils.formatUnits(allowanceAmt, decimals)
      } catch(e) {
        alert("Not an SEP20 Address: "+coinType)
	return
      }

      //var gasPrice = await provider.getStorageAt("0x0000000000000000000000000000000000002710","0x00000000000000000000000000000000000000000000000000000000000000002")
      //if(gasPrice == "0x") {
      //  gasPrice = "0x0"
      //}

      var totalAmount = this.amount*payeeList.length
      if(balance < totalAmount) {
        alert("You do not own enough "+symbol+" to send! "+payeeList.length+" payees needs "+totalAmount+" and you only have "+balance)
        return
      }
      if(allowance < totalAmount) {
        const ok = confirm("You haven't approve enough "+symbol+" to this DApp. "+payeeList.length+" payees needs "+totalAmount+" and you only approved "+allowance+". Do you want to approve now?")
	if(ok) {
	  const maxAmount = "0x0FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
	  alert("Transaction for approving will be sent. Please retry after it succeeds.")
          sep20Contract.connect(signer).approve(ChequeContractAddress, maxAmount/*, {gasPrice: gasPrice}*/)
	}
	return
      }

      const sendAmt = ethers.utils.parseUnits(this.amount.toString(), decimals)

      const deadlineTimestamp = new Date(this.deadline).getTime() / 1000

      var hasHashTag = this.passphrase.startsWith("#")
      var hasPassphrase = this.passphrase.length != 0 && !hasHashTag
      var passphraseHashList = []
      var memoEncList = []
      for(var i=0; i<payeeList.length; i++) {
        var memo = this.memo
        if(hasHashTag) {
	  const hex = strToBytes32Hex(this.passphrase)
          if(hex.length<=66) {
            passphraseHashList.push(hex)
          } else {
            alert('Hashtag "'+this.passphrase+'" is too long')
            return
          }
        } else if(hasPassphrase) {
          const salt = genRand()
	  var hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(salt+this.passphrase))
	  hash = "0x00"+hash.substr(4) // force the highest byte to be zero
          passphraseHashList.push(hash)
          memo = salt+""+memo
        } else {
          passphraseHashList.push(ethers.utils.parseUnits(0))
        }
	const encHex = encryptMsgWithKey(memo, encPubkeyList[i])
        memoEncList.push(encHex)
      }
      if(payeeList.length == 1) {
        await chequeContract.writeCheque(payeeList[0], coinType, sendAmt, deadlineTimestamp,
	                passphraseHashList[0], memoEncList[0]/*, {gasPrice: gasPrice}*/)
      } else {
        await chequeContract.writeCheques(payeeList, coinType, sendAmt, deadlineTimestamp,
			passphraseHashList, memoEncList/*, {gasPrice: gasPrice}*/)
      }
    },
  },
  async mounted() {
    var deadline = new Date()
    var t = deadline.getTime() + 7 * 24 * 3600 * 1000
    deadline.setTime(t)
    deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset())
    this.deadline = deadline.toISOString().slice(0,16)
  }
}
</script>
