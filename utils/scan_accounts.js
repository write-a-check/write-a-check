const { ethers } = require("ethers");


const hexToReferID = function(hex) {
  var res = ""
  const table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"
  for (var i = 0; i < hex.length; i+=2) {
    const n = parseInt(hex.substr(i, 2), 16)
    if(isNaN(n)) {return null}
    res += table[n%64]
  }
  return res
}


async function run() {
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
  const endHeight = await provider.getBlockNumber()
  var code2addr = new Map()
  for(var i=1; i<endHeight; i++) {
      if(i%1000==0) {
            console.log("======== "+i+" ======="+code2addr.size)
      }
      try {
        const blk = await provider.getBlockWithTransactions(i)
        for(var j=0; j<blk.transactions.length; j++) {
            const tx = blk.transactions[j]
            const referID = hexToReferID(tx.from.substr(2,22))
            if(code2addr.has(referID)) {
               if(code2addr.get(referID) != tx.from) {
		 console.log("WHY!!!", referID, code2addr.get(referID), tx.from)
	       }
            } else {
               code2addr.set(referID, tx.from)
               console.log("Found ", tx.from, referID)
            }
        }
      } catch(e) {
        console.log(e)
        console.log(i)
      }
  }
  //for(const acc of accounts.keys()) {
  //        console.log("Account: ", acc)
  //}
}

run()
