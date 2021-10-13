const { ethers } = require("ethers");

async function run() {
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
  const endHeight = await provider.getBlockNumber()
  var accounts = new Map()
  for(var i=1; i<endHeight; i++) {
      if(i%1000==0) {
            console.log("======== "+i+" ======="+accounts.size)
      }
      try {
        const blk = await provider.getBlockWithTransactions(i)
        for(var j=0; j<blk.transactions.length; j++) {
            const tx = blk.transactions[j]
            if(!accounts.has(tx.from)) {
               accounts.set(tx.from, true)
            }
        }
      } catch(e) {
        console.log(e)
        console.log(i)
      }
  }
  for(const acc of accounts.keys()) {
          console.log("Account: ", acc)
  }
}

run()
