<template>
  <div id="app">
    <GenericModal v-if="$store.state.modal.show"></GenericModal>
    <Navbar v-if="$store.state.loggedInEmployee"></Navbar>
    <router-view />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar"
import GenericModal from "@/components/GenericModal"

export default {
  name: 'App',
  data() {
    return {
      }
  },
  mounted() {
    this.$store.commit('close_modal')
  },
  components: {
    'Navbar': Navbar,
    'GenericModal': GenericModal
  }
}
</script>