<template>
    <k-dialog
      id="entity-explorer"
      :modal="true"
      @close="handleClose"
      :width="900"
      title="Entity Explorer"
    >
      <div>
          <table class="table table-bordered table-sm">
            <thead>
              <tr>
                <td>Entity</td>
                <td>Last Updated</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entity in $store.state.entities" :key="entity.friendlyName">
                <td class="align-middle">{{entity.friendlyName}}</td>
                <td class="align-middle">{{ entity.lastUpdated ? kendo.toString(new Date(entity.lastUpdated),"T") : "Not Loaded" }}</td>
                <td class="align-middle"><kendo-button icon="reload" :disabled="entitiesLoading.includes(entity.getAction)" @click="handleEntityReload(entity.getAction)"></kendo-button></td>
              </tr>
            </tbody>
          </table>
      </div>

      <dialog-actions-bar>
        <button class="k-button" style="background-color: #dddddd" @click="handleClose">Close</button>
      </dialog-actions-bar>
    </k-dialog>
</template>

<script>
export default {
    name: "EntityExplorer",
    data() {
      return {
        entitiesLoading: []
      }
    },
    methods: {
        handleClose() {
            this.$store.commit('close_entity_explorer')
            
        },
        async handleEntityReload(getAction) {
          this.entitiesLoading = [...this.entitiesLoading,getAction];
          await this.$store.dispatch(getAction);
          this.entitiesLoading = this.entitiesLoading.filter( i => i !== getAction);
        }
    }
}
</script>

<style>
  #entity-explorer.k-window-titlebar {
    padding: .25rem;
  }

  #entity-explorer + .k-window-content {
    padding: .25rem;
  }
</style>