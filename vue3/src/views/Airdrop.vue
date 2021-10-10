<template>
  <div class="normal">
   <p>Work In Progress</p>
   <p>
   <button @click="signMessage" style="font-size: 24px; width: 300px">Test</button>
   </p>
  </div>
</template>

<style>
textarea, input {
    font-size:20px;
    width: 560px;
}
p {
    text-align: center;
}
button {
    font-size:20px;
}
</style>

<script>
export default {
  data() {
    return {
      comment: ""
    }
  },
  methods: {
    async signMessage() {
      if (typeof window.ethereum === 'undefined') {
        alertNoWallet()
        return
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const msg = await signer.signMessage("Welcome to smartBCH")
      console.log(msg)
    },
  },
  async mounted() {
    if(this.$route.query.referID && localStorage.getItem("referID") === null) {
      try {
        const referID = ethers.utils.getAddress(this.$route.query.referID)
	localStorage.setItem("referID", referID)
      } catch(e) {
        //do nothing
      }
    }
  }
}
</script>
