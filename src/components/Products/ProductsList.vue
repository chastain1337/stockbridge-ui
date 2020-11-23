<template>
  <div class="container container-fluid">
  <div v-if="dataIsLoading" style="font-size: 16pt" class="text-center">
        <div
          style="width: 16pt; height: 16pt"
          class="spinner-border"
          role="status"
        ></div>
        {{`Fetching ${entityBeingLoaded}...`}}
      </div>
      </div>
</template>

<script>
export default {
  props: {  },
  name: "ProductsList",
  data() {
    return {
        dataIsLoading: true,
        entityBeingLoaded: null
    };
  },
  methods: {  },
  async mounted() {
      if (this.$store.state.entities.products.data.length === 0) {
          this.entityBeingLoaded = "Products"
          await this.$store.dispatch("getProducts");
      }

      if (this.$store.state.entities.locations.data.length === 0) {
          this.entityBeingLoaded = "Warehouse Locations"
          await this.$store.dispatch("getLocations");
      }

      if (this.$store.state.entities.vendors.data.length === 0) {
          this.entityBeingLoaded = "Vendors"
          await this.$store.dispatch("getVendors");
      }
      //this.dataIsLoading = false;

  },
  computed: {
  },
};
</script>

<style scoped>
</style>