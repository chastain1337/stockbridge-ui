<template>
  <div class="container-fluid mt-2">
    <h1>Bulk Importer</h1>
    <div class="row mb-2">
      <div class="col-2">
        <kendo-dropdownlist
          :data-source="bulkImportOptions"
          optionLabel="Entity to Import"
          v-model="selectedEntityStoreAction"
          data-text-field="name"
          data-value-field="storeAction"
        ></kendo-dropdownlist>
      </div>
      <div class="col-3">
        <button class="btn btn-outline-danger" @click="resetGrid" :disabled="!gridData">Reset</button>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <grid
          :enableBulkPaste="true"
          :data="gridData"
          :columns="gridColumns"
          :totalRows="totalRows"
          @dataChange="dataChange"
          :validations="entityValidations"
          :buttonsToInclude="['ALL']"
          :submitHandler="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gridEntityData from "@/Shared/gridEntityData";
import EditableGrid from "@/shared/Components/EditableGrid";
import allValidations from "@/shared/validations"

export default {
  name: "BulkImporter",
  components: { grid: EditableGrid },
  data() {
    return {
      bulkImportOptions: [
        {
          name: "Employees",
          url: "/api/Employee/GetEmployees",
          storeAction: "getEmployees",
        },
      ],
      selectedEntityStoreAction: "",
      gridData: null,
      gridColumns: null,
      totalRows: 5,
      pastedText: "",
      modalVisible: false,
      pasteIntoRow: 1,
      entityValidations: null
    };
  },
  methods: {
    handleSubmit() {
      console.log("Submit clicked");
    },
    dataChange(gridData) {
      this.totalRows = Math.max(gridData.length,this.totalRows)
      this.gridData = gridData;
    },
    openModal() {
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
    },
    resetGrid() {
      this.selectedEntityStoreAction = "";
      this.gridData = null;
      this.gridColumns = null;
    },
    refreshGridAfterDataLoad() {
      // Does not update the store with new data
      let thisValidationObject;
      let sampleData = {};
      let columns = [];
      switch (this.selectedEntityStoreAction) {
        // Define sampleData based on entity selected
        case "getEmployees":
          const firstRowOfData = { ...this.$store.state.employees[0] };
          const entityData = { ...gridEntityData.employees };
          delete entityData.id; // no ID field on creation

          for (let field in firstRowOfData) {
            if (entityData[field]) {
              columns.push({
                field: field,
                title: entityData[field].friendlyName,
                editor: entityData[field].editor,
              });
              sampleData[field] = null;
            }
          }
          thisValidationObject = allValidations.employeeValidations;
      }

      this.entityValidations = thisValidationObject;
      this.gridColumns = columns;
      this.gridData = [];

    },
  },
  watch: {
    selectedEntityStoreAction: async function (val) {
      if (val) {
        // Get data
        await this.$store.dispatch(this.selectedEntityStoreAction);
        this.refreshGridAfterDataLoad();
      }
    },
  },
};
</script>

<style>
td.invalid-e {
  color: red;
  background-color: pink;
}
td.invalid-o {
  color: rgb(151, 0, 0);
  background-color: rgb(248, 135, 154);
}

.k-numerictextbox {
  width: 100px;
}
</style>
