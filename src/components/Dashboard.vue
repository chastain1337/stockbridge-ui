<template>
    <div class="container mt-5 text-center">
      <h1>Welcome, {{ $store.state.loggedInEmployee.firstName}}</h1>
      
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
