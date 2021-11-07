<template>
  <div class="normal">
   <p style="font-size: 16px"></p>
   <p>Blockchain cheque is a new idea. We want to promote it through airdrops. At the beginning, we would like to start with $CATS (address: <span style="user-select: none;">0x265bD28d79400D55a1665707Fa14A72978FA6043</span>). So if you have some $CATS token, please donate some to these airdrop events. Thank you very much!</p>
   <p>The community has donated a large amount of $CATS to this airdrop project, and after some airdrop events, now we still have {{totalDonation}} $CATS remained. <a href="https://www.checkbook.cash/donations.html">Here</a> is a full list of donations, which is periodically updated.</p>
   <table style="margin: auto; border-spacing: 15px;">
   <tr><td><b>Receiver of Donation:</b><br/>
   {{receipt}}</td></tr>
   <tr><td><b>The cold wallet for Donation:</b><br/>
   {{coldWallet}}</td></tr>
   <tr><td><b>Amount to Donate:</b>
   <input v-model="amount" type="number" class="userinput" placeholder="Please enter a number"></td></tr>
   <tr><td><b>Your name (optional):</b>
   <input v-model="donator" class="userinput" type="text">
   </td></tr>
   <tr><td><b>Your comment (optional):</b>
   <textarea v-model="comment" class="usertextarea" rows="10" cols="40"></textarea>
   <p style="text-align: center">
   <button class="button is-info" @click="donate" style="font-size: 24px; width: 200px">Donate</button>
   <br></p>
   </td></tr>
   </table>
   <p style="text-align: center"><br>
   <button class="button is-info is-light is-small" @click="showLatest" :disabled="isLoading" style="font-size: 24px; width: 300px">Show Latest Donations</button><br>
   <a href="https://www.checkbook.cash/donations.html">Full List (periodically updated)</a></p>
   <table border=1>
   <tr><th>Height</th><th>Donator's name</th><th>Amount</th><th>Comment</th></tr>
   <template v-for="(entry, idx) in donations" :keys="entry.id">
   <tr><td>{{entry.height}}</td><td>{{entry.name}}</td><td>{{entry.amount}}</td>
   <td><span style="white-space: pre-line">{{entry.comment}}</span></td></tr>
   </template>
   </table>
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
function hex2arr(s) {
  var u8arr = new Uint8Array(Math.ceil(s.length / 2));
  for (var i = 0; i < u8arr.length; i++) {
    u8arr[i] = parseInt(s.substr(i*2, 2), 16);
  }
  return u8arr
}

async function getDonations(coinType, receipt, provider, maxCount) {
	var toBlock = await provider.getBlockNumber()
	var filter = {
		address: coinType,
		topics: [
			ethers.utils.id("Transfer(address,address,uint256)"),
			null,
			"0x000000000000000000000000"+receipt.substr(2),
		]
	}
	const STEPS = 50000
	var donations = []
	var dec = new TextDecoder()
	while(toBlock > 0) {
		filter.toBlock = toBlock
		filter.fromBlock = Math.max(toBlock-STEPS, 0)
		const logs = await provider.getLogs(filter)
		for(var i=logs.length-1; i>=0; i--) {
			const tx = await provider.getTransaction(logs[i].transactionHash)
			const amount = ethers.BigNumber.from("0x"+tx.data.substr((4+32)*2+2, 64))
			if(tx.from == receipt) {
				continue
			}
			var entry = {
				id: tx.from+":"+tx.blockNumber,
				height: tx.blockNumber,
				donator: tx.from,
				amount: ethers.utils.formatUnits(amount, 2),
				name: "",
				comment: "",
			}
			var arr = hex2arr(tx.data.slice((4+64)*2+2))
			if(arr.length != 0) {
				var len = arr[0]
				entry.name = dec.decode(arr.slice(1, len+1))
				entry.comment = dec.decode(arr.slice(1+len))
			}
			console.log(entry)
			donations.push(entry)
			if(donations.length >= maxCount) {
				return donations
			}
		}
		toBlock -= STEPS
	}
	return donations
}

export default {
  data() {
    return {
      coinType: "0x265bD28d79400D55a1665707Fa14A72978FA6043",
      receipt: "0x05dd8925dbeF0aeCeC5B68032A0691076A92Ea41",
      coldWallet: "0xA08C722701A5A430267Db229Db12bb8f3A8f76c1",
      totalDonation: 0,
      donations: [],
      amount: 0,
      donator: "",
      isLoading: false,
      comment: ""
    }
  },
  methods: {
    async donate() {
      if(!connectWallet()) {
        return
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      if(this.amount == 0) {
        alert("The donation amount is zero!")
	return
      }
      const sep20Contract = new ethers.Contract(this.coinType, SEP20ABI, provider)
      const myAddr = await signer.getAddress()
      const balanceAmt = await sep20Contract.balanceOf(myAddr)
      const decimals = await sep20Contract.decimals()
      const balance = ethers.utils.formatUnits(balanceAmt, decimals)
      if(balance < this.amount) {
        alert("You do not own "+ this.amount +" $CATS to send! you only have "+balance)
        return
      }
      const receiptPad32 = ethers.utils.hexZeroPad(this.receipt, 32)
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
        to: this.coinType,
        from: myAddr,
        value: "0x00", 
        data: data,
      }

      await ethereum.request({method: 'eth_sendTransaction', params: [transactionParameters]})
    },
    async showLatest() {
      if (typeof window.ethereum === 'undefined') {
        alertNoWallet()
        return
      }
      this.isLoading = true
      this.donations = []
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const sep20Contract = new ethers.Contract(this.coinType, SEP20ABI, provider)
      var balanceAmt = await sep20Contract.balanceOf(this.receipt)
      const decimals = await sep20Contract.decimals()
      this.totalDonation = ethers.utils.formatUnits(balanceAmt, decimals)*1.0
      console.log("totalDonation", this.totalDonation)
      var balanceAmt = await sep20Contract.balanceOf(this.coldWallet)
      this.totalDonation += ethers.utils.formatUnits(balanceAmt, decimals)*1.0
      console.log("totalDonation", this.totalDonation)
      this.donations = await getDonations(this.coinType, this.receipt, provider, 10)
      this.isLoading = false
    }
  },
  async mounted() {
    this.isLoading = true
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const sep20Contract = new ethers.Contract(this.coinType, SEP20ABI, provider)
      var balanceAmt = await sep20Contract.balanceOf(this.receipt)
      const decimals = await sep20Contract.decimals()
      this.totalDonation = ethers.utils.formatUnits(balanceAmt, decimals)*1.0
      console.log("totalDonation", this.totalDonation)
      var balanceAmt = await sep20Contract.balanceOf(this.coldWallet)
      this.totalDonation += ethers.utils.formatUnits(balanceAmt, decimals)*1.0
      console.log("totalDonation", this.totalDonation)
      this.donations = await getDonations(this.coinType, this.receipt, provider, 10)
      this.isLoading = false
  }
}
</script>
