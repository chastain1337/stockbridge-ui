<template>
  <nav class="navbar navbar-expand my-0">
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
        <button
        @click="showEntityExplorer"
          class="nav-link btn btn-secondary"
        >Entity Explorer</button>
      </li>
      <li class="nav-item mr-4">
        <router-link
          class="nav-link k-button"
          :to="'/MyAccount'"
        >{{ $store.state.loggedInEmployee.firstName.substring(0,1) + $store.state.loggedInEmployee.lastName.substring(0,1) }}</router-link>
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
    showEntityExplorer() {
      this.$store.commit("open_entity_explorer")
    }
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