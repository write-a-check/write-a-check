<template>
  <div class="normal">
  <p style="background: #E8E8E8; width: 220px; margin: auto; border-radius: 12px; text-align: center; font-size: 24px;"><a href="/">
  <span style="color: green">C</span>
  <span style="color: cyan">H</span>
  <span style="color: blue">E</span>
  <span style="color: purple">C</span>
  <span style="color: red">K</span>
  <span style="color: orange">B</span>
  <span style="color: yellow">O</span>
  <span style="color: green">O</span>
  <span style="color: cyan">K</span></a>
  </p>
  </div>
  <div id="nav" style="font-size: 24px; width: 600px; margin: auto">
    <router-link tag="li" to="/app/">receive</router-link><span style="color: #EEEEEE"> | </span>
    <router-link tag="li" to="/app/write">write</router-link><span style="color: #EEEEEE"> | </span>
    <router-link tag="li" to="/app/revoke">revoke</router-link><span style="color: #EEEEEE"> | </span>
    <router-link tag="li" to="/app/donate">donate</router-link><span style="color: #EEEEEE"> | </span>
    <router-link tag="li" to="/app/about">about</router-link>
  </div>
  <router-view/>
</template>

<style>
</style>  

<script>
export default {
  data() {
    return {
    }
  },
  async mounted() {
  }
}
</script>

