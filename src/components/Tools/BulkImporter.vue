<template>
  <div class="container-fluid mt-2">
    <h1>Bulk Importer</h1>
    <div class="row mb-2">
      <div class="col-2">
        <kendo-dropdownlist
          :data-source="bulkImportOptions"
          optionLabel="Entity to Import"
          @select="handleDropdownChange"
          data-text-field="name"
          data-value-field="name"
          :value="dropdownValue"
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
          :entityData="entityData"
          :totalRows="totalRows"
          @dataChange="dataChange"
          :validations="entityValidations"
          :buttonsToInclude="['ALL']"
          :submitHandler="handleSubmit"
          :submitting="submitting"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gridEntityData from "@/Shared/gridEntityData";
import EditableGrid from "@/Shared/Components/EditableGrid";
import allValidations from "@/Shared/validations";
import apiModels from '@/Shared/apiModels';

export default {
  name: "BulkImporter",
  components: { grid: EditableGrid },
  data() {
    return {
      bulkImportOptions: [
        {
          name: "Employees",
          storeActions: {get: "getEmployees,getRoles,getDepartments", post: "upsertEmployees"}
        },
        {
          name: "Roles",
          storeActions: {get: "getRoles", post: "upsertRoles"}
        },
        {
          name: "Departments",
          storeActions: {get: "getDepartments", post: "upsertDepartments"}
        },
        {
          name: "Ordering Methods",
          storeActions: {get: "getOrderingMethods", post: ""}
        },
        {
          name: "Warehouse Locations",
          storeActions: {get: "getLocations", post: ""}
        },
        {
          name: "Vendors",
          storeActions: {get: "getVendors", post: ""}
        },
        {
          name: "Products",
          storeActions: {get: "getProducts,getVendors", post: ""}
        },
      ],
      selectedEntityActions: {get: "", post: ""},
      gridData: null,
      gridColumns: null,
      totalRows: 5,
      pastedText: "",
      modalVisible: false,
      pasteIntoRow: 1,
      entityValidations: null,
      dropdownValue: "",
      upsertRequestModel: null,
      submitting: false,
      entityData: {}
    };
  },
  methods: {
    handleDropdownChange(e) {
      this.dropdownValue = e.dataItem.name;
      this.selectedEntityActions = {...e.dataItem.storeActions};
    },
    async handleSubmit() {
      this.submitting = true
      const upsertModels = this.gridData.filter(e => Object.values(e).every(v => v != null && v != '')).map( r => new this.upsertRequestModel(r));
      console.log(upsertModels);
      await this.$store.dispatch(this.selectedEntityActions.post,upsertModels)
      this.submitting = false
      await this.getDataForEntity(this.selectedEntityActions.get);
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
      this.dropdownValue = "";
      this.gridData = null;
      this.gridColumns = null;
    },
    refreshGridAfterDataLoad() {
      // Does not update the store with new data
      let thisValidationObject,entityData;

      switch (this.selectedEntityActions.get) {
        // Define sampleData based on entity selected
        case "getEmployees,getRoles,getDepartments":
          entityData = { ...gridEntityData.employees };
          this.upsertRequestModel = apiModels.UpsertEmployeeRequest
          thisValidationObject = allValidations.employeeValidations;
          break;
          
        case "getRoles":
          
          entityData = { ...gridEntityData.roles };
          this.upsertRequestModel = apiModels.UpsertRoleRequest
          thisValidationObject = allValidations.roleValidations;
          break;

        case "getDepartments":
          
          entityData = { ...gridEntityData.departments };
          this.upsertRequestModel = apiModels.UpsertDepartmentRequest
          thisValidationObject = allValidations.departmentValidations;
          break;

        case "getOrderingMethods":
          entityData = { ...gridEntityData.orderingMethods };
          //this.upsertRequestModel = apiModels.UpsertDepartmentRequest
          //thisValidationObject = allValidations.departmentValidations;
          break;

        case "getLocations":
          entityData = { ...gridEntityData.locations };
          // this.upsertRequestModel = apiModels.UpsertDepartmentRequest
          // thisValidationObject = allValidations.departmentValidations;
          break;
        
        case "getVendors":
          entityData = { ...gridEntityData.vendors };
          // this.upsertRequestModel = apiModels.UpsertDepartmentRequest
          // thisValidationObject = allValidations.departmentValidations;
          break;

        case "getProducts,getVendors":
          entityData = { ...gridEntityData.products };
          // this.upsertRequestModel = apiModels.UpsertDepartmentRequest
          // thisValidationObject = allValidations.departmentValidations;
          break;
      }

      this.entityData = entityData;
      this.gridData = [];
      this.entityValidations = thisValidationObject;

      //const entityDataFields = {...entityData.fields}
      //delete entityDataFields.id; // no ID field on creation

           

    },
    async getDataForEntity(storeActions) {
      const actions = storeActions.split(",")
        for (let i = 0; i < actions.length; i++) {
          await this.$store.dispatch(actions[i]);
        }
    }
  },
  watch: {
    selectedEntityActions: async function (val) {
      if (val) {
        // Get data
        await this.getDataForEntity(this.selectedEntityActions.get);
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
