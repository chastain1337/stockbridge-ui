<template>
  <div id="app">
    <Navbar v-if="this.$store.state.loggedInEmployee"></Navbar>
    <router-view />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar"

export default {
  name: 'App',
  data() {
    return {
      }
  },
  components: {
    'Navbar': Navbar,
  }
}
</script>