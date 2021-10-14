<template>
  <div class="normal">
    <br>
    <p style="text-align: center">
    <button @click="list" :disabled="isLoading" style="width: 280px">List checks sent to me</button>&nbsp;&nbsp;&nbsp;&nbsp;
    <button @click="toggle" style="width: 180px">{{toggleBtnText}}</button>
    </p>

    <div v-show="showOptions">
    <input v-model="filter_acceptAddrList" type="checkbox" style="width: 20px; height: 20px" >
    Only show checks which are sent from:<br/>
    <textarea v-model="acceptAddrList" style="width: 500px; font-size: 16px" placeholder="Each line contains an address and (optionally) some comments of this address" rows="10" cols="40"></textarea><br/>
    <input v-model="filter_denyAddrList" type="checkbox" style="width: 20px; height: 20px" >
    Do NOT show checks which are sent from:<br/>
    <textarea v-model="denyAddrList" style="width: 500px; font-size: 16px" placeholder="Each line contains an address and (optionally) some comments of this address" rows="10" cols="40"></textarea><br/>

    <input v-model="filter_sep20Address" type="checkbox" style="width: 20px; height: 20px" >
    Only show checks of this coin:
    <input v-model="sep20Address" type="text" style="width: 500px" placeholder="Enter an SEP20 token's symbol or address"><br/>

    <input v-model="filter_minAmount" type="checkbox" style="width: 20px; height: 20px" >
    Only show checks whose amounts are no less than
    <input v-model="minAmount" type="number" style="width: 330px" placeholder="0.0"><br/>

    <input v-model="filter_hashtag" type="checkbox" style="width: 20px; height: 20px" >
    Only show checks whose hashtag is
    <input v-model="hashtag" type="text" style="width: 435px" placeholder="Leave here black for checks without any hashtag"><br/>

    <input v-model="onlyActive" type="checkbox" style="width: 20px; height: 20px" checked>
    Only show active checks (not been accepted, refused, nor expired, i.e. passed deadline).<br/>

    <input v-model="verboseMode" type="checkbox" style="width: 20px; height: 20px" checked>
    Verbose Mode (show the cheque's sender, issue time and token's address).<br/>
    </div>

    <hr/>

    <p v-show="isLoading" style="text-align: center"><img src="/loading.gif"></p>
    <p v-show="inactiveChequeInstead"><b>Found no active cheques, some old inactive cheques are shown below:</b></p>
    <p v-show="chequeNotFound">No cheque found</p>
    <p v-show="doAll">
    <button @click="refuseAll" style="width: 280px">Refuse all active checks</button>
    <br><br>
    <button @click="acceptAll" style="width: 480px">Accept all active checks without passphrases</button>
    </p>
    <p v-show="showTotalCoins">Totally there are {{totalCoins}} {{coinSymbol}} waiting for your acceptance.</p>
    <template v-for="(cheque, idx) in chequeList" :keys="cheque.id">
    Status:&nbsp;<b>{{cheque.status}}</b> 
    Value: <b>{{cheque.amount}} <a :href="cheque.coinURL" target="_blank">{{cheque.coinSymbol}}</a></b>&nbsp;
    <button @click="addToWallet" :id="cheque.coinType" :name="cheque.coinSymbol" style="font-size: 14px">watch {{cheque.coinSymbol}}</button><br>
    <span v-show="cheque.hasTag">Tag: {{cheque.tag}}</span><br>
    <span v-show="verboseMode">
    From: {{cheque.drawer}}&nbsp;&nbsp;&nbsp;<br/>
    Address of {{cheque.coinSymbol}}: {{cheque.coinType}}<br/>
    Issue Time: {{cheque.startTimeStr}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br/>
    </span>
    Deadline: {{cheque.deadlineStr}}&nbsp;&nbsp;
    <span v-show="cheque.status=='active'">Remain: {{cheque.remainTime}}</span><br/>
    <span v-show="cheque.withMemo">Memo:
    <a @click.stop.prevent="decrypt" v-bind:id="cheque.id" v-bind:name="cheque.encryptedMemo" href="javascript:">
    Click here to decrypt the memo</a><br/></span>
    <p v-if="cheque.status=='active'" style="text-align: right">
    <button @click="refuse" v-bind:name="cheque.id">Refuse</button>&nbsp;&nbsp;&nbsp;&nbsp;
    <button @click="accept" v-bind:name="cheque.id">Accept</button>
    </p>
    <br v-else>
    </template>
  </div>
</template>

<style>
</style>

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
      return chequeList
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
      verboseMode: false,
      inactiveChequeInstead: false,
      isLoading: false,
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
      this.doAll = false
      this.chequeList = []
      this.isLoading = true
      this.inactiveChequeInstead = false
      var chequeList0 = await getChequeList()
      var cfg = {
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
      }
      var chequeList =  filterCheques(chequeList0, cfg)
      if(chequeList.length == 0 && cfg.onlyActive) {
        cfg.onlyActive = false
        chequeList =  filterCheques(chequeList0, cfg)
	if(chequeList != 0) {
	  this.inactiveChequeInstead = true
	}
	if(chequeList.length > 5) {
	  chequeList = chequeList.slice(chequeList.length-5, chequeList.length)
	}
      }
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
      this.doAll = chequeList.length != 0 && !this.inactiveChequeInstead
      this.chequeList = chequeList
      this.isLoading = false
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
      var passphrase = "0x"
      if(cheque.hasPassphrase) {
        passphrase = prompt("Please enter the secret tag of this check:")
	console.log("use salt", cheque.salt)
        passphrase = cheque.salt + passphrase
	passphrase = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(passphrase)) // double hash
        try {
          await chequeContract.estimateGas.acceptCheque(cheque.id, passphrase)
        } catch(e) {
	  alert("Failed to estimate gas, maybe you entered incorrect passphrase")
	  return
	}
      } else {
        const storedReferee = localStorage.getItem("referID")
        if(storedReferee !== null) {
          passphrase = "0x"+storedReferee
        }
	console.log("passphrase from referID", passphrase)
      }
      const gasPrice = ethers.BigNumber.from("0x3e63fa64")
      await chequeContract.acceptCheque(cheque.id, passphrase, {gasPrice: gasPrice})
    },
    async addToWallet(event) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const sep20Contract = new ethers.Contract(event.target.id, SEP20ABI, provider)
      const decimals = await sep20Contract.decimals()
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: event.target.id,
	    symbol: event.target.name,
	    decimals: decimals,
          },
        },
      })
    },
    async refuse(event) {
      const ok = confirm("Are you sure to refuse this cheque and give up the coins in it?")
      if(!ok) {
        return
      }
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
        alert("Too many cheques to accept. We can just accept the first 50 cheques.")
	idList = idList.slice(0, 50)
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      console.log("idList", idList)
      await chequeContract.acceptCheques(idList, "0x")
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
      const storedReferee = localStorage.getItem("referee")
      if(storedReferee !== null) {
        referee = storedReferee
      }
      switchAllow(true, referee)
    },
  },
  async mounted() {
    if (typeof window.ethereum === 'undefined') {
      alertNoWallet()
      return
    }
    if(this.$route.query.referee && localStorage.getItem("referee") === null) {
      try {
        const referee = ethers.utils.getAddress(this.$route.query.referee)
	localStorage.setItem("referee", referee)
      } catch(e) {
        //do nothing
      }
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
