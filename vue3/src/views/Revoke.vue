<template>
  <div class="normal">
    <h5>Here you can list all the checks sent by you, and revoke the expired ones (which have passed the deadline)</h5>
    <p style="text-align: center">
    <button @click="list" style="width: 280px">List checks sent by me</button>
    </p>
    <hr/>
    <p v-show="chequeNotFound">No cheque found</p>
    <p v-show="canRevoke" style="text-align: center">
    <button @click="revoke" style="width: 280px">Revoke all expired checks</button>
    </p>
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
async function getChequeList() {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const myAddr = await signer.getAddress()
      const myAddrPad32 = ethers.utils.hexZeroPad(myAddr, 32)
      var chequeList = []
      var coinInfoMap = new Map()
      var revokedMap = new Map()
      var acceptedMap = new Map()
      var refusedMap = new Map()
      var filter = {address: ChequeContractAddress, topics: [null, null, null, myAddrPad32]}
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
      return chequeList
}

export default {
  data() {
    return {
      chequeNotFound: false,
      canRevoke: false,
      revokableIdList: [],
      chequeList: []
    }
  },
  methods: {
    async list() {
      var chequeList = await getChequeList()
      chequeList.sort(function(a,b) {return a.deadline - b.deadline})
      this.chequeNotFound = chequeList.length == 0
      this.chequeList = chequeList

      var idList = []
      for(var i=0; i<chequeList.length; i++) {
        if(chequeList[i].status=="expired") {
	  idList.push(chequeList[i].id)
	}
      }
      this.canRevoke = idList.length != 0
      this.revokableIdList = idList
    },
    async revoke() {
      if(this.revokableIdList.length == 0) {
        alert("Cannot find expired checks")
	return
      } else if(this.revokableIdList.length > 50) {
        alert("Too many cheques to revoke. We can just refuse the first 50 cheques.")
	this.revokableIdList = this.revokableIdList.slice(0, 50)
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      await chequeContract.revokeCheques(this.revokableIdList)
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
