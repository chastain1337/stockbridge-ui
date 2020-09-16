<template>
    <div class="container mt-5 text-center">
      <h1 v-if="$store.state.loggedInEmployee">Welcome, {{ $store.state.loggedInEmployee.firstName}}</h1>
      <div v-else style="font-size: 20pt"><div style="width: 20pt; height: 20pt;" class="spinner-border" role="status"></div> Fetching account information...</div>
    </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data () {
    return {  
    }
  },
  methods: {
    handleLogout() {
      this.$store.commit('clear_login');
      this.$router.push("Login");
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
