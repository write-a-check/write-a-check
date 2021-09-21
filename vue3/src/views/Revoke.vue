<template>
  <h3>Here you can list all the checks sent by you, and revoke the expired ones (which have passed the deadline)</h3>
  <div class="normal">
    <p style="text-align: center">
    <button @click="list" style="width: 280px">List checks sent by me</button>&nbsp;&nbsp;&nbsp;&nbsp;
    <button @click="revoke" style="width: 280px">Revoke all expired checks</button>
    </p>
    <hr/>

    <p v-show="chequeNotFound">No cheque found</p>
    <template v-for="(cheque, idx) in chequeList" :keys="cheque.id">
    From: {{cheque.drawer}}&nbsp;&nbsp;&nbsp;Status:&nbsp;<b>{{cheque.status}}</b><br/>
    Value: <b>{{cheque.amount}} {{cheque.coinSymbol}}</b>({{cheque.coinType}})<br/>
    Start: {{cheque.startTimeStr}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    Deadline: {{cheque.deadlineStr}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span v-if="cheque.hasTag">Tag: {{cheque.tag}}</span><br>
    <br/>
    </template>
  </div>
</template>

<script>
async function getChequeList(cfg) {
      console.log("cfg", cfg)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const myAddr = await signer.getAddress()
      const myAddrPad32 = ethers.utils.hexZeroPad(myAddr, 32)
      const NewCheque = ethers.utils.id("NewCheque(address,uint256,address,uint256,uint256,uint256,bytes)")
      const RevokeCheque = ethers.utils.id("RevokeCheque(address,uint256)")
      const AcceptCheque = ethers.utils.id("AcceptCheque(address,uint256)")
      const RefuseCheque = ethers.utils.id("RefuseCheque(address,uint256)")
      const SetEncryptionPubkey = ethers.utils.id("SetEncryptionPubkey(address,address,uint256)")
      const UnsetEncryptionPubkey = ethers.utils.id("UnsetEncryptionPubkey(address)")
      var chequeList = []
      var coinInfoMap = new Map()
      var revokedMap = new Map()
      var acceptedMap = new Map()
      var refusedMap = new Map()
      var filter = {address: ChequeContractAddress, topics: [null, myAddrPad32]}
      const STEPS = 50000
      var toBlock = await provider.getBlockNumber()
      const blockCountInOneMonth = 30*24*3600/5
      const endHeight = Math.max(0, toBlock - 1.5*blockCountInOneMonth)
      while(toBlock > endHeight) {
        filter.toBlock = toBlock
	filter.fromBlock = Math.max(toBlock-STEPS+1, 0)
        var logs = await provider.getLogs(filter)
	for(var i=0; i<logs.length; i++) {
	  if(logs[i].topics[0] == NewCheque) {
	    chequeList.push(await parseNewCheque(coinInfoMap, logs[i].topics, logs[i].data))
	  } else if(logs[i].topics[0] == RevokeCheque) {
	    revokedMap.set(logs[i].topics[2], true)
	  } else if(logs[i].topics[0] == AcceptCheque) {
	    acceptedMap.set(logs[i].topics[2], true)
	  } else if(logs[i].topics[0] == RefuseCheque) {
	    refusedMap.set(logs[i].topics[2], true)
	  }
	}
	toBlock -= STEPS
      }

      for(var i=0; i<chequeList.length; i++) {
        var cheque = chequeList[i]
	if(revokedMap.has(cheque.id)) {
	  cheque.status = "revoked"
	}
	if(acceptedMap.has(cheque.id)) {
	  cheque.status = "accepted"
	}
	if(refusedMap.has(cheque.id)) {
	  cheque.status = "refused"
	}
      }
      return filterCheques(chequeList, cfg)
}

export default {
  data() {
    return {
      chequeNotFound: false,
      chequeList: []
    }
  },
  methods: {
    async list() {
      var sep20Addr, symbol
      if(this.filter_sep20Address) {
        [sep20Addr, symbol] = await getSEP20AddrAndSymbol(this.sep20Address)
        if(sep20Addr === null) {
          return
        }
      }
      localStorage.setItem("cfg-filter_acceptAddrList", this.filter_acceptAddrList? "yes" : "no")
      localStorage.setItem("cfg-acceptAddrList", this.acceptAddrList)
      localStorage.setItem("cfg-filter_denyAddrList", this.filter_denyAddrList? "yes" : "no")
      localStorage.setItem("cfg-denyAddrList", this.denyAddrList)
      localStorage.setItem("cfg-filter_sep20Address", this.filter_sep20Address? "yes" : "no")
      localStorage.setItem("cfg-sep20Address", this.sep20Address)
      localStorage.setItem("cfg-filter_minAmount", this.filter_minAmount? "yes" : "no")
      localStorage.setItem("cfg-minAmount", this.minAmount)
      localStorage.setItem("cfg-filter_hashtag", this.filter_hashtag? "yes" : "no")
      localStorage.setItem("cfg-hashtag", this.hashtag)
      localStorage.setItem("cfg-onlyActive", this.onlyActive)
      const hashtagHex = strToBytes32Hex(this.hashtag)
      if(hashtagHex.length>66) {
        alert('Hashtag is too long: "'+this.hashtag+'"')
	return
      }
      var chequeList = await getChequeList({
        "filter_acceptAddrList": this.filter_acceptAddrList,
        "acceptAddrList": this.acceptAddrList,
        "filter_denyAddrList": this.filter_denyAddrList,
        "denyAddrList": this.denyAddrList,
        "filter_sep20Address": this.filter_sep20Address,
        "sep20Address": sep20Addr,
        "filter_minAmount": this.filter_minAmount,
        "minAmount": this.minAmount,
        "filter_hashtag": this.filter_hashtag,
        "hashtag": hashtagHex,
	"onlyActive": this.onlyActive
      })
      chequeList.sort(function(a,b) {return a.deadline - b.deadline})
      this.chequeNotFound = chequeList.length == 0
      this.chequeList = chequeList
    },
  },
  async mounted() {
    if (typeof window.ethereum === 'undefined') {
      alertNoWallet()
      return
    }
  }
}
</script>
