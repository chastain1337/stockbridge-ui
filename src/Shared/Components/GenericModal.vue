<template>
    <k-dialog
      :modal="true"
      @close="handleClose"
      :width="$store.state.modal.settings.width"
      :title="$store.state.modal.settings.headerText"
    >
      <div>
          {{ $store.state.modal.settings.message }}
      </div>

      <dialog-actions-bar>
        <button class="k-button" style="background-color: #dddddd" @click="handleClose">{{ $store.state.modal.settings.affirmText }}</button>
      </dialog-actions-bar>
    </k-dialog>
</template>

<script>
export default {
    name: "Modal",
    methods: {
        handleClose() {
            this.$store.commit('close_modal')
            
        }
    }
}
</script>