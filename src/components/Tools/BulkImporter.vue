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
          @columnChange="columnChange"
          :validations="entityValidations"
          :buttonsToInclude="['ALL']"
          :submitHandler="handleSubmit"
          :submitting="submitting"
          :allowCustomFields="allowCustomFields"
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
          allowCustomFields: false,
          storeActions: {get: "getEmployees,getRoles,getDepartments", post: "upsertEmployees"}
        },
        {
          name: "Roles",
          allowCustomFields: false,
          storeActions: {get: "getRoles", post: "upsertRoles"}
        },
        {
          name: "Departments",
          allowCustomFields: false,
          storeActions: {get: "getDepartments", post: "upsertDepartments"}
        },
        {
          name: "Ordering Methods",
          allowCustomFields: false,
          storeActions: {get: "getOrderingMethods", post: "upsertOrderingMethods"}
        },
        {
          name: "Warehouse Locations",
          allowCustomFields: false,
          storeActions: {get: "getLocations", post: "upsertWarehouseLocations"}
        },
        {
          name: "Vendors",
          allowCustomFields: true,
          storeActions: {get: "getVendors,getOrderingMethods", post: "upsertVendors"}
        },
        {
          name: "Products",
          allowCustomFields: true,
          storeActions: {get: "getProducts,getVendors,getLocations", post: "upsertProducts"}
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
      entityData: {},
      allowCustomFields: false
    };
  },
  methods: {
    handleDropdownChange(e) {
      this.dropdownValue = e.dataItem.name;
      this.selectedEntityActions = {...e.dataItem.storeActions};
      this.allowCustomFields = e.dataItem.allowCustomFields

    },
    async handleSubmit() {
      this.submitting = true
      let upsertModels = [];
      const filteredData = this.gridData.filter(o => {
        if (o.customFields) {
          if (Object.values(o.customFields).join('').length > 0) {
            return true
          } else {
            const oCopy = {...o}
            delete oCopy.customFields
            return Object.values(oCopy).join('').length > 0
          }
        } else {
          return Object.values(o).join('').length > 0
        }
      });
      filteredData.forEach( row => {
        if (!this.allowCustomFields) {
          upsertModels.push(new this.upsertRequestModel(row))
        } else {
          let customFields = []
          this.gridColumns.forEach( col => {
            if (col.custom) {
              const cf = { 
                friendlyName: col.title,
                systemName: col.field,
                description: col.description,
                value: row.customFields[col.field]
              }
              customFields.push(new apiModels.GenericCustomField(cf));
            }
          })
          // customFields = [GenericCustomField]
          upsertModels.push(new this.upsertRequestModel(row,customFields));
        }
      });
      await this.$store.dispatch(this.selectedEntityActions.post,upsertModels)
      this.submitting = false
      await this.getDataForEntity(this.selectedEntityActions.get);
    },
    dataChange(gridData) {
      this.totalRows = Math.max(gridData.length,this.totalRows)
      this.gridData = gridData;
    },
    columnChange(newColumns) {
      this.gridColumns = newColumns
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
          this.upsertRequestModel = apiModels.UpsertOrderingMethodRequest
          thisValidationObject = allValidations.orderingMethodValidations
          break;

        case "getLocations":
          entityData = { ...gridEntityData.locations };
           this.upsertRequestModel = apiModels.UpsertLocationRequest
            thisValidationObject = allValidations.locationValidations;
          break;
        
        case "getVendors,getOrderingMethods":
          entityData = { ...gridEntityData.vendors };
           this.upsertRequestModel = apiModels.UpsertVendorRequest
          thisValidationObject = allValidations.vendorValidations;
          break;

        case "getProducts,getVendors,getLocations":
          entityData = { ...gridEntityData.products };
           this.upsertRequestModel = apiModels.UpsertProductRequest
           thisValidationObject = allValidations.productValidations;
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
