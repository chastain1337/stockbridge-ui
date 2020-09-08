<template>
  <div id="app">
    <GenericModal v-if="$store.state.modal.show"></GenericModal>
    <ToastHolder></ToastHolder>
    <Navbar v-if="$store.state.loggedInEmployee"></Navbar>
    <router-view />
  </div>
</template>

<script>
import Navbar from "@/Shared/Components/Navbar"
import GenericModal from "@/Shared/Components/GenericModal"
import ToastHolder from "@/Shared/Components/ToastHolder"

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
    'GenericModal': GenericModal,
    'ToastHolder': ToastHolder
  }
}
</script>