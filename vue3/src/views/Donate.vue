<template>
  <div class="normal">
   <p>Blockchain cheque is a new idea. We want to promote it through airdrops. At the beginning, we would like to start with $CATS. So if you have some $CATS token, please donate some to this airdrop events. Thank you very much!</p>
   <table style="margin: auto; border-spacing: 15px;">
   <tr><td><b>Address of $CATS</b><br/>
   </td>
   <td>0x265bD28d79400D55a1665707Fa14A72978FA6043</td></tr>
   <tr><td><b>Amount to Donate</b></td>
   <td><input v-model="amount" type="number" placeholder="Please enter a number"></td></tr>
   <tr><td><b>Your name (optional)</b>
   </td>
   <td><input v-model="donator" type="text">
   </td></tr>
   <tr><td><b>Your comment (optional)</b>
   </td>
   <td><textarea v-model="comment" rows="10" cols="40"></textarea></td></tr>
   </table>
   <div style="margin: auto; width: 40%"><br/>
   <button @click="donate" style="font-size: 24px; width: 300px">Donate</button></div>
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
export default {
  data() {
    return {
      amount: 0,
      donator: "",
      comment: ""
    }
  },
  methods: {
    async donate() {
      if (typeof window.ethereum === 'undefined') {
        alertNoWallet()
        return
      }
      const coinType = "0x265bD28d79400D55a1665707Fa14A72978FA6043"
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      if(this.amount == 0) {
        alert("The donation amount is zero!")
	return
      }
      const sep20Contract = new ethers.Contract(coinType, SEP20ABI, provider)
      const myAddr = await signer.getAddress()
      const balanceAmt = await sep20Contract.balanceOf(myAddr)
      const decimals = await sep20Contract.decimals()
      const balance = ethers.utils.formatUnits(balanceAmt, decimals)
      if(balance < this.amount) {
        alert("You do not own "+ this.amount +" $CATS to send! you only have "+balance)
        return
      }
      const receipt = "0x05dd8925dbeF0aeCeC5B68032A0691076A92Ea41"
      const receiptPad32 = ethers.utils.hexZeroPad(receipt, 32)
      const amount256 = ethers.utils.hexZeroPad(ethers.utils.parseUnits(this.amount.toString(), decimals), 32)
      //console.log(amount256)
      var data = "0xa9059cbb"+receiptPad32.slice(2)+amount256.slice(2)
      //console.log(data)

      const encoder = new TextEncoder()
      const donatorUTF8 = encoder.encode(this.donator)
      if(donatorUTF8.length > 100) {
        alert("Your name is too long: "+this.donator)
        return
      }
      
      data = data + donatorUTF8.length.toString(16).padStart(2, '0')
      data = data + uint8ArrayToHex(donatorUTF8)
      //console.log("add donator", data)
      data = data + uint8ArrayToHex(encoder.encode(this.comment))
      //console.log("add comment", data)

      const transactionParameters = {
        to: coinType,
        from: myAddr,
        value: "0x00", 
        data: data,
      }

      await ethereum.request({method: 'eth_sendTransaction', params: [transactionParameters]})
    },
  }
}
</script>
