<template>
  <h1>The Checks Sent to Me</h1>
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
    Only show checks whose amounts are large than
    <input v-model="minAmount" type="number" style="width: 330px" placeholder="0.0"><br/>

    <input v-model="filter_hashtag" type="checkbox" style="width: 20px; height: 20px" >
    Only show checks whose hashtag is
    <input v-model="hashtag" type="text" style="width: 435px" placeholder="Leave here black for checks without any hashtag"><br/>

    <input v-model="onlyActive" type="checkbox" style="width: 20px; height: 20px" checked>
    Only show active checks which have not been accepted, refused, nor passed deadline.<br/>
    </div>

    <hr/>

    <template v-for="(cheque, idx) in chequeList" :keys="cheque.id">
    <p>From: {{cheque.drawer}} Value: {{cheque.amount}} {{cheque.coinSymbol}} ({{cheque.coinType}})
    Start: {{(new Date().setTime(cheque.startTime)).toLocaleDateString()}}
    Deadline: {{(new Date().setTime(cheque.deadline)).toLocaleDateString()}}
    <span v-if="cheque.hasTag">Tag: {{cheque.tag}}</span><br>
    <span @click="decrypt" v-bind:id="cheque.id" v-bind:name="cheque.encryptedMemo">
    <u>Click here to decrypt the memo</u></span>
    </p>
    <p v-if="cheque.passDeadline">
    <i>This cheque has passed its deadline, you can not accept or refuse it</i>
    </p>
    <p v-else>
    <button @click="accept" v-bind:name="cheque.id">Accept</button>
    <button @click="refuse" v-bind:name="cheque.id">Refuse</button>
    </p>
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
//   deadline
//   passphraseHash
//   hasTag
//   tag
//   encryptedMemo
//   status: active, revoked, accepted, refused,
function getCoinSymbolAndDecimals(coinInfoMap, coinType) {
  if(coinInfoMap.has(coinType)) {
    return coinInfoMap[coinType]
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const sep20Contract = new ethers.Contract(coinType, SEP20ABI, provider)
  const symbol = await sep20Contract.symbol()
  const decimals = await sep20Contract.decimals()
  coinInfoMap[coinType] = [symbol, decimals]
  return [symbol, decimals]
}

function uint8ArrayFromHex(s) {
  var u8arr = new Uint8Array(Math.ceil(s.length / 2));
  for (var i = 0; i < u8arr.length; i++) {
    u8arr[i] = parseInt(s.substr(i * 2, 2), 16);
  }
  return u8arr
}

function strFromHex(hex) {
  const data = uint8ArrayFromHex(hex)
  const decoder = new TextDecoder("utf-8")
  return decoder.decode(data)
}

function parseNewCheque(coinInfoMap, topics, data) {
  var cheque = {}
  cheque.drawer = ethers.utils.getAddress("0x"+topics[3].substr(26))
  cheque.id = topics[2]
  cheque.payee = ethers.utils.getAddress("0x"+topics[1].substr(26))
  const coinTypeAndAmount = data.substr(4, 64)
  const startAndEndTime = data.substr(4+64, 64)
  cheque.passphraseHash = data.substr(4+64*2, 64)
  cheque.encryptedMemo = data.substr(4+64*4) //skip memo's offset and length
  cheque.coinType = ethers.utils.getAddress("0x"+coinTypeAndAmount.substr(0, 20*2))
  const [symbol, decimals] = getCoinSymbolAndDecimals(coinInfoMap, cheque.coinType)
  cheque.coinSymbol = symbol
  const amt = ethers.BigNumber.from("0x"+coinTypeAndAmount.substr(20*2, 12*2))
  cheque.amount = ethers.utils.formatUnits(amt, decimals)
  cheque.startTime = ethers.BigNumber.from("0x"+startAndEndTime.substr(16*2, 8*2)).toNumber()
  cheque.deadline = ethers.BigNumber.from("0x"+startAndEndTime.substr(24*2, 8*2)).toNumber()
  cheque.passDeadline = cheque.deadline > (1000 * Date.now())
  cheque.hasTag = cheque.passphraseHash.substr(0,2) == "23" // 0x23 is '#'
  if(cheque.hasTag) cheque.tag = strFromHex(cheque.passphraseHash)
}

function filterCheques(chequeList, cfg) {
  var newList = []
  var acceptMap = {}
  if(cfg.filter_acceptAddrList) {
    for(var i=0; i<cfg.acceptAddrList.length; i++) {
      acceptMap[acceptAddrList[i]] = true
    }
  }
  var denyMap = {}
  if(cfg.filter_denyAddrList) {
    for(var i=0; i<cfg.denyAddrList.length; i++) {
      denyMap[denyAddrList[i]] = true
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
      if(cheque.amount < cfg.filter_minAmount) {
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
      const myAddr = signer.getAddress()
      const myAddrPad32 = ethers.utils.hexZeroPad(myAddr)
      var chequeList = []
      var coinInfoMap = {}
      var revokedMap = {}
      var acceptedMap = {}
      var refusedMap = {}
	event RevokeCheque(address indexed payee, uint indexed id);
	event AcceptCheque(address indexed payee, uint indexed id);
	event RefuseCheque(address indexed payee, uint indexed id);
      var filterNewCheque = {address: ChequeContractAddress,
        topics: [ethers.utils.id("NewCheque(address,uint,address,uint,uint,uint,bytes)"), myAddrPad32]}
      var filterRevokeCheque = {address: ChequeContractAddress,
        topics: [ethers.utils.id("RevokeCheque(address,uint)"), myAddrPad32]}
      var filterAcceptCheque = {address: ChequeContractAddress,
        topics: [ethers.utils.id("AcceptCheque(address,uint)"), myAddrPad32]}
      var filterRefuseCheque = {address: ChequeContractAddress,
        topics: [ethers.utils.id("RefuseCheque(address,uint)"), myAddrPad32]}
      const STEPS = 50000
      var toBlock = await provider.getBlockNumber()
      while(toBlock > 0) {
        filterNewCheque.toBlock = toBlock
	filterNewCheque.fromBlock = Math.max(toBlock-STEPS, 0)
        const logs = await provider.getLogs(filter)
	for(var i=0; i<logs.length; i++) {
	  chequeList.push(parseNewCheque(coinInfoMap, logs[i].topics, logs[i].data))
	}
        filterRevokeCheque.toBlock = toBlock
	filterRevokeCheque.fromBlock = Math.max(toBlock-STEPS, 0)
        const logs = await provider.getLogs(filter)
	for(var i=0; i<logs.length; i++) {
	  revokedMap[logs[i].topics[2]] = true
	}
        filterAcceptCheque.toBlock = toBlock
	filterAcceptCheque.fromBlock = Math.max(toBlock-STEPS, 0)
        const logs = await provider.getLogs(filter)
	for(var i=0; i<logs.length; i++) {
	  acceptedMap[logs[i].topics[2]] = true
	}
        filterRefuseCheque.toBlock = toBlock
	filterRefuseCheque.fromBlock = Math.max(toBlock-STEPS, 0)
        const logs = await provider.getLogs(filter)
	for(var i=0; i<logs.length; i++) {
	  refusedMap[logs[i].topics[2]] = true
	}
	toBlock -= STEPS
      }

      for(var i=0; i<chequeList.length; i++) {
        var cheque = chequeList[i]
	if(revokedMap[cheque.id]) {
	  cheque.status = "revoked"
	}
	if(acceptedMap[cheque.id]) {
	  cheque.status = "accepted"
	}
	if(refusedMap[cheque.id]) {
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
      chequeList: []
    }
  },
  methods: {
    toggle() {
      this.showOptions = !this.showOptions
      this.toggleBtnText = this.showOptions? "Hide Options" : "Show Options"
    },
    async list() {
      const [sep20Addr, symbol] = await getSEP20AddrAndSymbol(this.sep20Address)
      if(sep20Addr === null) {
        return
      }
      localStorage.setItem("cfg-filter_acceptAddrList", this.filter_acceptAddrList? "yes" : "no")
      localStorage.setItem("cfg-acceptAddrList", this.acceptAddrList)
      localStorage.setItem("cfg-filter_denyAddrList", this.filter_acceptAddrList? "yes" : "no")
      localStorage.setItem("cfg-denyAddrList", this.denyAddrList)
      localStorage.setItem("cfg-filter_sep20Address", this.filter_acceptAddrList? "yes" : "no")
      localStorage.setItem("cfg-sep20Address", this.sep20Address)
      localStorage.setItem("cfg-filter_minAmount", this.filter_minAmount? "yes" : "no")
      localStorage.setItem("cfg-minAmount", this.minAmount)
      localStorage.setItem("cfg-filter_hashtag", this.filter_acceptAddrList? "yes" : "no")
      localStorage.setItem("cfg-hashtag", this.hashtag)
      localStorage.setItem("cfg-onlyActive", this.onlyActive)
      this.chequeList = getChequeList(this.onlyActive, {
        "filter_acceptAddrList": this.filter_acceptAddrList,
        "acceptAddrList": this.acceptAddrList,
        "filter_denyAddrList": this.filter_acceptAddrList,
        "denyAddrList": this.denyAddrList,
        "filter_sep20Address": this.filter_acceptAddrList,
        "sep20Address": sep20Addr,
        "filter_minAmount": this.filter_minAmount,
        "minAmount": this.minAmount,
        "filter_hashtag": this.filter_acceptAddrList,
        "hashtag": this.hashtag,
	"onlyActive": this.onlyActive
      })
    },
    async decrypt(event) {
      const result = this.chequeList.filter(cheque => cheque.id == event.target.id);
      if(result.length != 1) return
      const cheque = result[0]

      var encHex = event.target.name
      const encObj = hexToEncObj(encHex)
      cheque.decryptedMemo = await window.ethereum.request({
        method: 'eth_decrypt',
        params: [encodeObjAsHex(encObj), window.accounts[0]]
      })
      
      var memo = cheque.decryptedMemo
      if(!cheque.hasTag) {
	memo = memo.substr(16) //skip the salt
      }
      event.target.innerHTML = memo
    },

    async accept(event) {
      const result = this.chequeList.filter(cheque => cheque.id == event.target.name);
      if(result.length != 1) return
      const cheque = result[0]
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      var passphrase = ""
      if(!cheque.hasTag) {
        if(!cheque.has("decryptedMemo")) {
	  alert("Please decrypt the memo first")
	}
	const salt = cheque.decryptedMemo.substr(0, 16)
        passphrase = prompt("Please enter the passphrase of this check:")
        passphrase = salt + passphrase
        try {
          await chequeContract.estimateGas.acceptCheque(cheque.id, passphrase)
        } catch(e) {
	  alert("Failed to estimate gas, maybe you entered incorrect passphrase")
	  return
	}
      }
      //var gasPrice = await provider.getStorageAt("0x0000000000000000000000000000000000002710","0x00000000000000000000000000000000000000000000000000000000000000002")
      //if(gasPrice == "0x") {
      //  gasPrice = "0x0"
      //}
      await chequeContract.acceptCheque(cheque.id, passphrase/*, {gasPrice: gasPrice}*/)
    },

    async refuse(event) {
      const result = this.chequeList.filter(cheque => cheque.id == event.target.name);
      if(result.length != 1) return
      const cheque = result[0]
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chequeContract = new ethers.Contract(ChequeContractAddress, ChequeABI, provider).connect(signer)
      //var gasPrice = await provider.getStorageAt("0x0000000000000000000000000000000000002710","0x00000000000000000000000000000000000000000000000000000000000000002")
      //if(gasPrice == "0x") {
      //  gasPrice = "0x0"
      //}
      await chequeContract.refuseCheque(cheque.id/*, {gasPrice: gasPrice}*/)
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
