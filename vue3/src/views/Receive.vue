<template>
  <div class="normal">
    <p style="text-align: center">
    <button @click="list" style="width: 280px">List checks sent to me</button>&nbsp;&nbsp;&nbsp;&nbsp;
    <button @click="toggle" style="width: 180px">{{toggleBtnText}}</button>
    </p>

    <div v-show="showOptions">
    <table><tr><td>
    <input v-model="filter_acceptAddrList" type="checkbox" style="width: 20px; height: 20px" >
    Only show checks which are sent from:<br/>
    <textarea v-model="acceptAddrList" style="width: 500px; font-size: 16px" placeholder="Each line contains an address and (optionally) some comments of this address" rows="10" cols="40"></textarea><br/>
    </td><td>
    <input v-model="filter_denyAddrList" type="checkbox" style="width: 20px; height: 20px" >
    Do NOT show checks which are sent from:<br/>
    <textarea v-model="denyAddrList" style="width: 500px; font-size: 16px" placeholder="Each line contains an address and (optionally) some comments of this address" rows="10" cols="40"></textarea><br/>
    </td></tr></table>

    <input v-model="filter_sep20Address" type="checkbox" style="width: 20px; height: 20px" >
    Only show checks of this coin:
    <input v-model="sep20Address" type="text" style="width: 608px" placeholder="Enter an SEP20 token's symbol or address"><br/>

    <input v-model="filter_minAmount" type="checkbox" style="width: 20px; height: 20px" >
    Only show checks whose amounts are no less than
    <input v-model="minAmount" type="number" style="width: 330px" placeholder="0.0"><br/>

    <input v-model="filter_hashtag" type="checkbox" style="width: 20px; height: 20px" >
    Only show checks whose hashtag is
    <input v-model="hashtag" type="text" style="width: 435px" placeholder="Leave here black for checks without any hashtag"><br/>

    <input v-model="onlyActive" type="checkbox" style="width: 20px; height: 20px" checked>
    Only show active checks (not been accepted, refused, nor expired, i.e. passed deadline).<br/>
    </div>

    <hr/>

    <p v-show="chequeNotFound">No cheque found</p>
    <p v-show="doAll">
    <button @click="refuseAll" style="width: 280px">Refuse all active checks</button>&nbsp;&nbsp;&nbsp;&nbsp;
    <button @click="acceptAll" style="width: 480px">Accept all active checks without passphrases</button>
    </p>
    <p v-show="showTotalCoins">Totally there are {{totalCoins}} {{coinSymbol}} waiting for your acceptance.</p>
    <template v-for="(cheque, idx) in chequeList" :keys="cheque.id">
    From: {{cheque.drawer}}&nbsp;&nbsp;&nbsp;Status:&nbsp;<b>{{cheque.status}}</b><br/>
    Value: <b>{{cheque.amount}} {{cheque.coinSymbol}}</b>({{cheque.coinType}})<br/>
    Start: {{cheque.startTimeStr}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    Deadline: {{cheque.deadlineStr}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span v-if="cheque.hasTag">Tag: {{cheque.tag}}</span><br>
    Memo:
    <span v-if="cheque.withMemo">
    <a @click.stop.prevent="decrypt" v-bind:id="cheque.id" v-bind:name="cheque.encryptedMemo" href="javascript:">
    Click here to decrypt the memo</a></span>
    <span v-else style="color: grey"><i>this check has no memo</i></span>
    <br/>
    <p v-if="cheque.status=='active'" style="text-align: right">
    <button @click="refuse" v-bind:name="cheque.id">Refuse</button>&nbsp;&nbsp;&nbsp;&nbsp;
    <button @click="accept" v-bind:name="cheque.id">Accept</button>
    </p>
    <br v-else>
    </template>
  </div>
</template>

<script>
// A cheque's properties:
//   drawer
//   id
//   payee
//   coinType
//   coinSymbol
//   amount
//   startTime
//   startTimeStr
//   deadline
//   deadlineStr
//   passphraseHash
//   hasTag
//   tag
//   encryptedMemo
//   status: active, revoked, accepted, refused, expired

function filterCheques(chequeList, cfg) {
  console.log(chequeList)
  var newList = []
  var acceptMap = {}
  if(cfg.filter_acceptAddrList) {
    const lines = cfg.acceptAddrList.split("\n")
    for(var i=0; i<lines.length; i++) {
      console.log("here ", lines[i].trim())
      acceptMap[lines[i].trim()] = true
    }
  }
  var denyMap = {}
  if(cfg.filter_denyAddrList) {
    const lines = cfg.denyAddrList.split("\n")
    for(var i=0; i<lines.length; i++) {
      denyMap[lines[i].trim()] = true
    }
  }
  for(var i=0; i<chequeList.length; i++) {
    var cheque = chequeList[i]
    if(cfg.filter_acceptAddrList && !acceptMap[cheque.drawer]) {
      continue
    }
    if(cfg.filter_denyAddrList && denyMap[cheque.drawer]) {
      continue
    }
    if(cfg.filter_sep20Address && cheque.coinType != cfg.sep20Address) {
      continue
    }
    if(cfg.filter_minAmount) {
      if(cheque.amount < cfg.minAmount) {
        continue
      }
    }
    if(cfg.filter_hashtag && cheque.passphraseHash != cfg.hashtag) {
      continue
    }
    if(cfg.onlyActive && cheque.status != "active") {
      continue
    }
    newList.push(cheque)
  }
  return newList
}

async function getChequeList(cfg) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const myAddr = await signer.getAddress()
      const myAddrPad32 = ethers.utils.hexZeroPad(myAddr, 32)
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
	  console.log("log", logs[i])
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
      filter_acceptAddrList: false,
      acceptAddrList: "",
      filter_denyAddrList: false,
      denyAddrList: "",
      filter_sep20Address: false,
      sep20Address: "",
      filter_minAmount: false,
      minAmount: 0,
      filter_hashtag: false,
      hashtag: "",
      onlyActive: true,
      showOptions: false,
      toggleBtnText: "Show Options",
      chequeNotFound: false,
      doAll: false,
      showTotalCoins: false,
      totalCoins: 0,
      coinSymbol: "",
      chequeList: []
    }
  },
  methods: {
    toggle() {
      this.showOptions = !this.showOptions
      this.toggleBtnText = this.showOptions? "Hide Options" : "Show Options"
    },
    async list() {
      if (typeof window.ethereum === 'undefined') {
        alertNoWallet()
        return
      }
      //this.checkAllow()
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
      this.showTotalCoins = this.filter_sep20Address
      if(this.filter_sep20Address) {
        this.coinSymbol = symbol
	var total = 0.0
	for(var i=0; i<chequeList.length; i++) {
	  if(chequeList[i].status == "active") {
	    total += 1.0*chequeList[i].amount
	  }
	}
	this.totalCoins = total
      }
      chequeList.sort(function(a,b) {return a.deadline - b.deadline})
      this.chequeNotFound = chequeList.length == 0
      this.doAll = chequeList.length != 0
      this.chequeList = chequeList
    },
    async decrypt(event) {
      const result = this.chequeList.filter(cheque => cheque.id == event.target.id);
      if(result.length != 1) return
      const cheque = result[0]

      var encHex = event.target.name
      const encObj = hexToEncObj(encHex)
      const encObjHex = encodeObjAsHex(encObj)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      cheque.decryptedMemo = await window.ethereum.request({
        method: 'eth_decrypt',
        params: [encObjHex, accounts[0]]
      })
      
      var memo = cheque.decryptedMemo
      if(!cheque.hasTag) {
	memo = memo.substr(16) //skip the salt
      }
      event.target.parentNode.innerText = memo
    },

    async accept(event) {
      const result = this.chequeList.filter(cheque => cheque.id == event.target.name);
      if(result.length != 1) return
      const cheque = result[0]
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      var passphrase = ""
      if(cheque.hasPassphrase) {
        if(cheque.decryptedMemo === undefined) {
	  alert("Please decrypt the memo first")
	  return
	}
	const salt = cheque.decryptedMemo.substr(0, 16)
        passphrase = prompt("Please enter the secret tag of this check:")
        passphrase = salt + passphrase
	passphrase = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(passphrase)) // double hash
        try {
          await chequeContract.estimateGas.acceptCheque(cheque.id, passphrase)
        } catch(e) {
	  alert("Failed to estimate gas, maybe you entered incorrect passphrase")
	  return
	}
      }
      await chequeContract.acceptCheque(cheque.id, passphrase)
    },

    async refuse(event) {
      const result = this.chequeList.filter(cheque => cheque.id == event.target.name);
      if(result.length != 1) return
      const cheque = result[0]
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      await chequeContract.refuseCheque(cheque.id)
    },
    async refuseAll() {
      var idList = []
      for(var i=0; i<this.chequeList.length; i++) {
        if(this.chequeList[i].status=="active") {
	  idList.push(this.chequeList[i].id)
	}
      }
      if(idList.length == 0) {
        alert("Found no active checks.")
	return
      } else if(idList.length > 50) {
        alert("Too many cheques to refuse. We can just refuse the first 50 cheques.")
	idList = idList.slice(0, 50)
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      await chequeContract.refuseCheques(idList)
    },
    async acceptAll() {
      var idList = []
      for(var i=0; i<this.chequeList.length; i++) {
        if(this.chequeList[i].status=="active" && !this.chequeList[i].hasPassphrase) {
	  idList.push(this.chequeList[i].id)
	}
      }
      if(idList.length == 0) {
        alert("Found no active checks without secret tags.")
	return
      } else if(idList.length > 50) {
        alert("Too many cheques to accept. We can just refuse the first 50 cheques.")
	idList = idList.slice(0, 50)
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      await chequeContract.acceptCheques(idList)
    },
    async checkAllow() {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      const encPubkey = await chequeContract.encryptionPubkeys(await signer.getAddress())
      if(encPubkey != 0) {
        return
      }
      const ok = confirm("You have not allowed cheques to have memos. Do you want to enable memos?")
      if(!ok) {
        return
      }
      var referee = "0x0000000000000000000000000000000000000000"
      if(this.$route.query.refer && this.$route.params.refer.length != 0) {
	try {
	  referee = ethers.utils.getAddress(this.$route.params.refer)
	} catch (e) {
	  alert(this.$route.params.refer+" is not an valid address for referee.")
	  return
	}
      }
      switchAllow(true, referee)
    },
  },
  async mounted() {
    if (typeof window.ethereum === 'undefined') {
      alertNoWallet()
      return
    }
    var cfg = localStorage.getItem("cfg-filter_acceptAddrList")
    if(cfg !== null) {
      this.filter_acceptAddrList = (cfg == "yes")
    }
    cfg = localStorage.getItem("cfg-acceptAddrList")
    if(cfg !== null) {
      this.acceptAddrList = cfg
    }
    cfg = localStorage.getItem("cfg-filter_denyAddrList")
    if(cfg !== null) {
      this.filter_denyAddrList = (cfg == "yes")
    }
    cfg = localStorage.getItem("cfg-denyAddrList")
    if(cfg !== null) {
      this.denyAddrList = cfg
    }
    cfg = localStorage.getItem("cfg-filter_sep20Address")
    if(cfg !== null) {
      this.filter_sep20Address = (cfg == "yes")
    }
    cfg = localStorage.getItem("cfg-sep20Address")
    if(cfg !== null) {
      this.sep20Address = cfg
    }
    cfg = localStorage.getItem("cfg-filter_minAmount")
    if(cfg !== null) {
      this.filter_minAmount = (cfg == "yes")
    }
    cfg = localStorage.getItem("cfg-minAmount")
    if(cfg !== null) {
      this.minAmount = cfg
    }
    cfg = localStorage.getItem("cfg-filter_hashtag")
    if(cfg !== null) {
      this.filter_hashtag = (cfg == "yes")
    }
    cfg = localStorage.getItem("cfg-hashtag")
    if(cfg !== null) {
      this.hashtag = cfg
    }
  }
}
</script>
