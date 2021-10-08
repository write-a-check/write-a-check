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
   <tr><td><b>Tag</b>
   (If you mark it as a secret tag, then the receiver must enter this tag to get the coins.)</td>
   <td><input v-model="passphrase" type="text"
   placeholder="Leave here black if tag isn't needed"><br/>
   <input v-model="isRealPassphrase" type="checkbox" style="width: 20px; height: 20px" >
   This is a secret tag
   </td></tr>
   <tr><td><b>Memo</b>
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
      amount: 0,
      passphrase: "",
      isRealPassphrase: false,
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
       this.sep20Address = SEP206Address
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
      const addressList = this.addressList.split("\n")
      for(var i=0; i<addressList.length; i++) {
        if(addressList[i].trim().length == 0) {
	  continue
	}
        try {
          const payee = ethers.utils.getAddress(addressList[i].trim())
	  payeeList.push(payee)
        } catch(e) {
          alert("Invalid Payee's Address: "+addressList[i]+". Will ignore it.")
          continue
        }
      }
      if(payeeList.length == 0) {
        alert("Cannot find valid payees.")
	return
      }

      const hasHashTag = this.passphrase.length != 0 && !this.isRealPassphrase
      const hasPassphrase = this.passphrase.length != 0 && this.isRealPassphrase

      var encPubkeyList = [];
      for(var start=0; start<payeeList.length; start+=100) {
        const end = Math.min(start+100, payeeList.length)
	const encPubkeys = await chequeContract.batchReadEncryptionPubkeys(payeeList.slice(start, end))
	console.log("encPubkeys", encPubkeys)
	for(var i=start; i<end; i++) {
          const encPubkey = encPubkeys[i-start]
	  console.log("encPubkey", encPubkey)
          if(encPubkey.isZero() && (this.memo.length != 0 || hasPassphrase)) {
            alert("The payee "+payeeList[i]+" is refusing memos, which means you cannot send secret tags either.")
	  } else {
            encPubkeyList.push(ethers.utils.base64.encode(encPubkey))
	  }
	}
      }

      const [coinType, symbol] = await getSEP20AddrAndSymbol(this.sep20Address)
      if(coinType === null) {
        return
      }

      var balance, decimals, allowance;
      const sep20Contract = new ethers.Contract(coinType, SEP20ABI, provider)
      try {
        const addr = await signer.getAddress()
	const balanceAmt = await sep20Contract.balanceOf(addr)
	const allowanceAmt = await sep20Contract.allowance(addr, ChequeContractAddress)
        decimals = await sep20Contract.decimals()
        balance = ethers.utils.formatUnits(balanceAmt, decimals)
	allowance = ethers.utils.formatUnits(allowanceAmt, decimals)
      } catch(e) {
        alert("Not an SEP20 Address: "+coinType)
	return
      }

      const deadline = new Date(this.deadline).getTime()
      if(deadline < Date.now()) {
        alert("Deadline should be later than current.")
	return
      }
      if(deadline > Date.now() + 30*24*3600*1000) {
        alert("Deadline should be within 30 days.")
	return
      }
      const deadlineTimestamp =  deadline / 1000

      var totalAmount = this.amount*payeeList.length
      if(balance < totalAmount) {
        alert("You do not own enough "+symbol+" to send! "+payeeList.length+" payees needs "+totalAmount+" and you only have "+balance)
        return
      }
      if(this.sep20Address != SEP206Address && allowance < totalAmount) {
        const ok = confirm("You haven't approve enough "+symbol+" to this DApp. "+payeeList.length+" payees needs "+totalAmount+" and you only approved "+allowance+". Do you want to approve now?")
	if(ok) {
	  const maxAmount = "0x0FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
	  alert("Transaction for approving will be sent. Please retry after it succeeds.")
          sep20Contract.connect(signer).approve(ChequeContractAddress, maxAmount)
	}
	return
      }

      const sendAmt = ethers.utils.parseUnits(this.amount.toString(), decimals)
      var value = ethers.BigNumber.from(0)
      if(this.sep20Address == SEP206Address) {
        value = ethers.utils.parseUnits(totalAmount.toString(), decimals)
      }

      var passphraseHashList = []
      var memoEncList = []
      for(var i=0; i<payeeList.length; i++) {
        var memo = this.memo
        if(hasHashTag) {
	  const hex = strToBytes32Hex('#'+this.passphrase)
          if(hex.length<=66) {
            passphraseHashList.push(hex)
          } else {
            alert('The tag "'+this.passphrase+'" is too long')
            return
          }
        } else if(hasPassphrase) {
          const salt = genRand()
	  var hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(salt+this.passphrase))
	  hash = "0x00"+hash.substr(4) // force the highest byte to be zero
          passphraseHashList.push(hash)
          memo = salt+""+memo
        } else {
          passphraseHashList.push(ethers.utils.parseUnits("0"))
        }
        if(memo.length == 0) {
          memoEncList.push("0x") // zero-length bytes
        } else {
	  const encHex = encryptMsgWithKey(memo, encPubkeyList[i])
          memoEncList.push(encHex)
        }
      }
      if(payeeList.length == 1) {
        await chequeContract.writeCheque(payeeList[0], coinType, sendAmt, deadlineTimestamp,
	                passphraseHashList[0], memoEncList[0], {value: value})
      } else {
        const gas = await chequeContract.estimateGas.writeCheques(payeeList, coinType, sendAmt, deadlineTimestamp,
			passphraseHashList, memoEncList, {value: value})
	if(gas>7000000) {
	  alert("The count of payees is too large("+gas+"). Your transaction may fail because of high gas. Please reduce the count.")
	  return
	}
        await chequeContract.writeCheques(payeeList, coinType, sendAmt, deadlineTimestamp,
			passphraseHashList, memoEncList, {value: value})
      }
    },
  },
  async mounted() {
    var deadline = new Date()
    var t = deadline.getTime() + 7 * 24 * 3600 * 1000
    deadline.setTime(t)
    deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset())
    this.deadline = deadline.toISOString().slice(0,16)
    if(this.$route.query.sep20Address) {
      this.sep20Address = this.$route.query.sep20Address
    }
    if(this.$route.query.addressList) {
      this.addressList = this.$route.query.addressList
    }
    if(this.$route.query.amount) {
      this.amount = this.$route.query.amount
    }
    if(this.$route.query.hashtag) {
      this.passphrase = "#"+this.$route.query.hashtag
    }
    if(this.$route.query.memo) {
      this.memo = this.$route.query.memo
    }
  }
}
</script>
