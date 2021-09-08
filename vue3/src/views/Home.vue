<template>
  <h1>Write a Check on Blockchain</h1>
  <div class="normal">
    <p style="text-align: center"><img width="360" src="/favicon.svg"></p>
    <p>With this DApp, you can <a @click="read" href="">write a check</a> to a payee.</p>
    <p>This is a <a href="https://www.puredapp.org">Pure DApp</a>, which means its contract code and front-end code are both opensource and anyone can deploy them at anywhere.</p>
    <p>Currently, you have allowed checks sent to you.
    You can <a @click="refuse" href="">refuse further incoming checks</a>.</p>
    <p>Currently, you have not allowed checks sent to you.
    You can <a @click="allow" href="">allow incoming checks</a> now.</p>
    <p>Together with the check, this DApp can send a memo encrypted with your public key, which can only be decrypted with the payee's private key, such that no other people can know the original memo.</p>
    <p>As an enhancement to the traditional paper check, you can add a passphrase to your check. After received the check, the payee must enter the correct passphrase to get paid. You can send the passphrase to the payee with e-mail or IM Apps.</p>
    <p><b>CAVEAT:</b> This is an opensource software. It is provided “as is”, without warranty of any kind. Please use it <b>AT YOUR OWN RISK</b>.</p>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    read() {
      this.$router.push('read');
    },
    write() {
      this.$router.push('write');
    },
    passgen() {
      this.$router.push('passgen');
    } 
  }
}
</script>
