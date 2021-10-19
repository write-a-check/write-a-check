<template>
  <h2 style="background: #E8E8E8; width: 360px; margin: auto; border-radius: 25px; text-align: center; font-size: 24px;">
  <span style="color: red">B</span>
  <span style="color: orange">L</span>
  <span style="color: yellow">O</span>
  <span style="color: green">C</span>
  <span style="color: cyan">K</span>
  <span style="color: blue">C</span>
  <span style="color: purple">H</span>
  <span style="color: red">A</span>
  <span style="color: orange">I</span>
  <span style="color: yellow">N</span>&nbsp;
  <span style="color: green">C</span>
  <span style="color: cyan">H</span>
  <span style="color: blue">E</span>
  <span style="color: purple">C</span>
  <span style="color: red">K</span>
  <span style="color: orange">B</span>
  <span style="color: yellow">O</span>
  <span style="color: green">O</span>
  <span style="color: cyan">K</span>
  </h2>
  <div id="nav" style="font-size: 24px; width: 600px; margin: auto">
    <router-link style="text-decoration: none;" tag="li" to="/receive">receive</router-link><span style="color: #EEEEEE"> | </span>
    <router-link style="text-decoration: none;" tag="li" to="/write">write</router-link><span style="color: #EEEEEE"> | </span>
    <router-link style="text-decoration: none;" tag="li" to="/revoke">revoke</router-link><span style="color: #EEEEEE"> | </span>
    <router-link style="text-decoration: none;" tag="li" to="/donate">donate</router-link><span style="color: #EEEEEE"> | </span>
    <router-link style="text-decoration: none;" tag="li" to="/about">about</router-link>
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
      this.$router.push('receive');
  }
}
</script>

