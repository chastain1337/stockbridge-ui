<template>
  <div id="app">
    <GenericModal v-if="$store.state.modal.show"></GenericModal>
    <EntityExplorer v-if="$store.state.entityExplorer.show"></EntityExplorer>
    <ToastHolder></ToastHolder>
    <Navbar v-if="$store.state.loggedInEmployee"></Navbar>
    <router-view />
  </div>
</template>

<script>
import Navbar from "@/Shared/Components/Navbar"
import GenericModal from "@/Shared/Components/GenericModal"
import EntityExplorer from "@/Shared/Components/EntityExplorer"
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
    'ToastHolder': ToastHolder,
    'EntityExplorer': EntityExplorer
  }
}
</script>