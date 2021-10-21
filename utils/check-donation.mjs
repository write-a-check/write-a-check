import { ethers } from "ethers";
import * as fs from 'fs';

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
	var total = 0
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
			total += 1.0*entry.amount
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
	return [donations, total]
}

// ---------------------------------------

const provider = new ethers.providers.JsonRpcProvider("https://global.uat.cash")
const coinType = "0x265bD28d79400D55a1665707Fa14A72978FA6043"
const receipt = "0x05dd8925dbeF0aeCeC5B68032A0691076A92Ea41"
const [donations, total] = await getDonations(coinType, receipt, provider, 500000)
donations.sort(function(a,b) {return b.amount - a.amount})
var content = ["<html><body>"]
content.push('<p>Please donate on <a href="https://www.checkbook.cash/app/donate">https://www.checkbook.cash/app/donate</a>')
content.push("<p>Here is a list of all the donations to support the airdrop from checkbook.cash.</p>")
content.push("<p>This list is periodically updated. Last Update Time:&nbsp;"+(new Date).toISOString()+"</p>")
content.push("<p>Total donated coins: "+total+"</p>")
content.push("<table border=1>")
content.push("<tr><th>Height</th><th>Donator's name</th><th>Amount</th><th>Comment</th></tr>")
for(var i=0; i<donations.length; i++) {
	if(donations[i].amount <= 1) {continue}
	content.push("<tr><td>"+donations[i].height+"</td>")
	content.push("<td>"+donations[i].name+"</td>")
	content.push("<td>"+donations[i].amount+"</td>")
	content.push('<td><span style="white-space: pre-line">'+donations[i].comment+"</span></td></tr>")
}
content.push("</table></body></html>")
fs.writeFile("donations.html", content.join("\n"), function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
})
	
