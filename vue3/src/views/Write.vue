<template>
  <div class="normal">
   <table style="margin: 0 auto; border-spacing: 15px; width: 500px">
   <tr><td><b>Sender</b>(your wallet's current account):<br/>{{myAddress}}</td></tr>

   <tr><td><b>Token's Address or Symbol</b><br/>
   (Click <a @click.prevent.stop="useBCH" href="javascript:"><b>here</b></a> if sending BCH)
   <input v-model="sep20Address" type="text" class="userinput"
   placeholder="Please enter an SEP20 token's address or symbol"></td></tr>

   <tr><td><br><b>Payees' Addresses</b>(send checks to them)<br/>
   You can also paste any text in the text area below, and
   <a @click.prevent.stop="extract" href="javascript:"><b>extract addresses from it</b></a>.
   <textarea v-model="addressList" placeholder="Please enter addresses in HEX format. One address in a line" 
   class="usertextarea" rows="6" cols="40"></textarea></td></tr>

   <tr><td><br><b>Amount to Send to Each Payee</b>
   <input v-model="amount" type="number" class="userinput" placeholder="Please enter a number"></td></tr>
   <tr><td><br><b>Deadline/Expiry Date</b><br>If a check is not accepted by this date, it will be cancelled and funds can be returned to sender.
   <input v-model="deadline" class="userinput" type="datetime-local"></td></tr>
   <tr><td><br><b>Tag</b>
   (If you mark it as a secret tag, then the receiver must enter this tag to accept the check.)
   <input v-model="passphrase" class="userinput" type="text"
   placeholder="Leave here blank if a tag isn't needed"><br/>
   <input v-model="isRealPassphrase" type="checkbox" class="userinput" style="width: 20px; height: 20px" >
   This is a secret tag
   </td></tr>
   <tr><td><br><b>Memo</b>
   (It will be encrypted if the payee has enabled memo-encryption, or else sent as clear text)
   <textarea v-model="memo" class="usertextarea" rows="10" cols="40"
   placeholder="Please enter some text to explain what is the purpose of this check.&#10Leave here blank if you have nothing to explain."></textarea>
   </td></tr>
   </table>
   <p style="text-align: center"><br><button class="button is-info" @click="submit" style="font-size: 24px; width: 200px" :disabled="isSubmitting">Submit</button></p>
  </div>
</template>

<style>
p {
    text-align: center;
}
button {
    font-size:20px;
}
</style>

<script>
function genRand() {
      var arr = window.crypto.getRandomValues(new Uint8Array(16))
      return uint8ArrayToHex(arr)
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
      isSubmitting: false,
      myAddress: "[unknown]",
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
      if(!connectWallet()) {
        return
      }
      this.isSubmitting = true
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
        this.isSubmitting = false
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
          if(encPubkey.isZero()) {
            encPubkeyList.push("")
	  } else {
            encPubkeyList.push(ethers.utils.base64.encode(encPubkey))
	  }
	}
      }

      const [coinType, symbol] = await getSEP20AddrAndSymbol(this.sep20Address)
      if(coinType === null) {
        this.isSubmitting = false
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
        this.isSubmitting = false
	return
      }

      const deadline = new Date(this.deadline).getTime()
      if(deadline < Date.now()) {
        alert("Deadline should be later than current.")
        this.isSubmitting = false
	return
      }
      if(deadline > Date.now() + 30*24*3600*1000) {
        alert("Deadline should be within 30 days.")
        this.isSubmitting = false
	return
      }
      const deadlineTimestamp =  deadline / 1000

      var totalAmount = this.amount*payeeList.length
      if(balance < totalAmount) {
        alert("You do not own enough "+symbol+" to send! "+payeeList.length+" payees needs "+totalAmount+" and you only have "+balance)
        this.isSubmitting = false
        return
      }
      if(this.sep20Address != SEP206Address && allowance < totalAmount) {
        const ok = confirm("You haven't approve enough "+symbol+" to this DApp. "+payeeList.length+" payees needs "+totalAmount+" and you only approved "+allowance+". Do you want to approve now?")
	if(ok) {
	  const maxAmount = "0x0FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
	  alert("Transaction for approving will be sent. Please retry after it succeeds.")
          sep20Contract.connect(signer).approve(ChequeContractAddress, maxAmount)
	}
        this.isSubmitting = false
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
            this.isSubmitting = false
            return
          }
        } else if(hasPassphrase) {
          const salt = deadlineTimestamp.toString()+" "+payeeList[i].substr(2)+" "
	  var hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(salt+this.passphrase))
	  hash = ethers.utils.keccak256(hash) // double hash
	  hash = "0x00"+hash.substr(4) // force the highest byte to be zero
          passphraseHashList.push(hash)
	  console.log("gen salt", salt)
        } else {
          passphraseHashList.push(ethers.utils.parseUnits("0"))
        }
        if(memo.length == 0) {
          memoEncList.push("0x")
        } else {
	  const encHex = encryptMsgWithKeyWrap(memo, encPubkeyList[i])
	  console.log("encHex", encHex)
          memoEncList.push(encHex)
        }
      }
      if(payeeList.length == 1) {
        await chequeContract.writeCheque(payeeList[0], coinType, sendAmt, deadlineTimestamp,
	                passphraseHashList[0], memoEncList[0], {value: value})
      } else {
        console.log(payeeList, coinType, sendAmt, deadlineTimestamp,
			passphraseHashList, memoEncList)
        const gas = await chequeContract.estimateGas.writeCheques(payeeList, coinType, sendAmt, deadlineTimestamp,
			passphraseHashList, memoEncList, {value: value})
	if(gas>7000000) {
	  alert("The count of payees is too large("+gas+"). Your transaction may fail because of high gas. Please reduce the count.")
          this.isSubmitting = false
	  return
	}
        const gasPrice = ethers.BigNumber.from("0x3e63fa64")
        await chequeContract.writeCheques(payeeList, coinType, sendAmt, deadlineTimestamp,
			passphraseHashList, memoEncList, {value: value, gasPrice: gasPrice})
      }
      this.isSubmitting = false
    },
  },
  async mounted() {
    if(!connectWallet()) {
      return
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    this.myAddress = await signer.getAddress()
    var deadline = new Date()
    var t = deadline.getTime() + 7 * 24 * 3600 * 1000
    deadline.setTime(t)
    deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset())
    this.deadline = deadline.toISOString().slice(0,16)
    if(this.$route.query.coin) {
      this.sep20Address = this.$route.query.coin
    }
    if(this.$route.query.to) {
      this.addressList = this.$route.query.to
    }
    if(this.$route.query.amount) {
      this.amount = this.$route.query.amount
    }
    if(this.$route.query.tag) {
      this.passphrase = "#"+this.$route.query.tag
    }
    if(this.$route.query.memo) {
      this.memo = this.$route.query.memo
    }
  }
}
</script>
