import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'

window.ABI = [
  "function getChequeContent(address payee, uint id) external view returns (address coinType, uint96 amount, address drawer, uint64 deadline, bytes32 passphraseHash)",
  "function setEncryptionPubkey(uint key) external",
  "function unsetEncryptionPubkey() external",
  "function writeCheque(address payee, uint id, address coinType, uint96 amount, uint64 deadline, bytes32 passphraseHash, bytes calldata memo) external payable",
  "function revokeCheque(address payee, uint id) external",
  "function receiveCheque(uint id, bool accept, bytes calldata passphrase) external"]
	
window.alertNoWallet = () => {
      alert("No wallet installed! Please install MetaMask or other web3 wallet to use this App.");
}

if (typeof window.ethereum === 'undefined') {
  alertNoWallet()
} else {
  ethereum.request({ method: 'eth_requestAccounts' })
}

createApp(App).use(router).mount('#app')

