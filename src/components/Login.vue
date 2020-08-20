<template>
    <div class="container">
      <div id="login-container" class="p-5" >
        <img id="bridge" class="img-fluid" src="~@/assets/Arch_bridge_icon.svg">
        <div class="input-group">
          <div class="input-group mb-1">
            <input type="text" class="form-control" placeholder="Username" v-model="username" />
          </div>
          <div class="input-group mb-2">
            <input type="password" class="form-control" placeholder="Password" v-model="password" />
          </div>
          <button class="m-auto btn btn-light" @click="login">Login</button>
        </div>
      </div>
      <div id="image-container-outer">
        <div id="image-container-inner"></div>
      </div>
    </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    login() {
      const username = this.username;
      const password = this.password;
      if (this.password.length > 0 && this.username.length > 0) {
        this.$store
          .dispatch("login", { username, password })
          .then(() => this.$router.push("Dashboard"))
          .catch((err) => {});
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#bridge {
  filter: invert(100%) sepia(0%) saturate(7437%) hue-rotate(296deg) brightness(98%) contrast(117%);
}
#login-container {
  background-color: rgba(30, 30, 36, 0.5);
  width: 40%;
  margin: 10% auto;
  
}

#image-container-inner {
  background-color: #c4af9a;
}

#image-container-outer {
  background: url(~@/assets/city_hall.jpg);
  background-size: cover;
  opacity: 0.5;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}
</style>