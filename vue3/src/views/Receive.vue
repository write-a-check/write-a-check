<template>
  <h1>The Checks Sent to Me</h1>
  <div class="normal">
    Only show checks of this coins: <input v-model="sep20Address" type="text" placeholder="Enter coin symbol or address"><br/>
    Only show checks whose amounts are large than
    <input v-model="minAmount" type="number" style="width: 150px" placeholder="0.0"><br/>
    Only show checks which are sent from
    <input v-model="fromAddr" type="text" style="width: 500px" placeholder="Enter sender's HEX address or tipb.ch aliases"><br/>
    Only show checks whose passphrase is
    <input v-model="passphrase" type="text" style="width: 495px" placeholder="Leave here black to allow any passphrases"><br/>
    Only show checks which have no passphrase
    <input v-model="noPassphrase" type="checkbox" style="width: 20px; height: 20px" ><br/>
    <p style="text-align: center"><button @click="list" style="width: 280px">List checks sent to me</button></p>
    <hr/>
    <template v-for="(entry, sn) in memos" :keys="entry.timestamp">
      <b>#{{sn+1}}<code>&nbsp;&nbsp;{{entry.timestamp}}&nbsp;&nbsp;</code></b>
      <button @click="remove" v-bind:id="entry.id" v-bind:name="entry.content"
      style="font-size:20px; width: 80px;">remove</button>
      <br/>
      <p>{{entry.content}}</p><br/>
    </template>
  </div>
</template>

<script>
</script>
 <input type="checkbox" id="checkbox" v-model="checked" />
