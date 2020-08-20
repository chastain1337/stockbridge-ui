<template>
  <nav class="navbar navbar-expand">
    <router-link class="navbar-brand" to="/Dashboard">
      <img src="~@/assets/Arch_bridge_icon.svg">
    </router-link>

    <ul class="navbar-nav mr-auto">
      <li class="nav-item mx-4" v-for="link in links" :key="link.route">
        <router-link class="nav-link" :to="link.route">{{ link.text}}</router-link>
      </li>
    </ul>
    <ul class="navbar-nav navbar-right">
      <li class="nav-item mr-4">
        <router-link
          class="nav-link btn btn-outline-dark btn-sm"
          :to="'/MyAccount'"
        >{{ $store.state.loggedInEmployee.firstName + ' ' + $store.state.loggedInEmployee.lastName }}</router-link>
      </li>
      <li class="nav-item">
        <a class="nav-link btn btn-light btn-sm" href="#" @click="handleLogout">Sign Out</a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {
      links: [
        { text: "Employees", route: "/Employees" },
        { text: "Orders", route: "/Orders" },
        { text: "Products", route: "/Products" },
        { text: "Tools", route: "/Tools" },
      ],
    };
  },
  methods: {
    handleLogout() {
      this.$store.commit("clear_login");
      this.$router.push("/Login");
    },
  },
};
</script>

<style scoped>
img {
  height: 28pt;
}

.router-link-active {
  color: white;
}

a {
  color: #1e1e24;
  font-size: 14pt;
}

a:hover {
  opacity: 0.5;
}

nav {
  background-color: #c4af9a;
}
</style>