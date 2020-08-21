<template>
  <div class="container-fluid mt-2">
    <k-dialog v-if="modalVisible" :modal="true" @close="closeModal" :width="800">
      <div class="container-fluid my-2">
        <div class="row">
          <div class="col text-center">
            <textarea
              style="width: 720px"
              v-model="pastedText"
              placeholder="Paste tab separated data here, including 'headers' row..."
            ></textarea>
          </div>
        </div>
      </div>
      <div class="row mx-2">
        <div class="col">Paste into / starting at row:</div>
      </div>
      <div class="row mx-2">
        <div class="col">
          <kendo-numerictextbox
            v-model.number="pasteIntoRow"
            :max="1000"
            :min="1"
            :decimals="0"
            :format="'#'"
          ></kendo-numerictextbox>
        </div>
      </div>

      <dialog-actions-bar>
        <button
          class="k-button"
          style="background-color: #81AE9D"
          @click="handlePaste"
          :disabled="this.pastedText.trim().length === 0"
        >Insert</button>
        <button class="k-button" style="background-color: #dddddd" @click="closeModal">Cancel</button>
      </dialog-actions-bar>
    </k-dialog>

    <h1>Bulk Importer</h1>
    <div class="row mb-4">
      <div class="col-3">
        <kendo-dropdownlist
          :data-source="bulkImportOptions"
          optionLabel="Entity to Import"
          v-model="selectedEntityStoreAction"
          data-text-field="name"
          data-value-field="storeAction"
        ></kendo-dropdownlist>
      </div>
      <div class="col-3">
        Blank Rows:
        <kendo-numerictextbox
          class="ml-2"
          v-model.number="blankRows"
          :max="500"
          :min="1"
          :decimals="0"
          :format="'#'"
          :disabled="!!gridData"
        ></kendo-numerictextbox>
      </div>
      <div class="col-2">
        <button class="btn btn-outline-danger" @click="resetGrid" :disabled="!gridData">Reset</button>
        <button
          class="btn btn-outline-success"
          type="button"
          :disabled="!gridData"
          @click="openModal"
        >Bulk Paste</button>
      </div>
    </div>

    <div class="row">
      <div class="col" @keyup="keyPressed">
        <Grid
          ref="grid"
          v-if="gridData"
          :data-items="gridData"
          :style="{height: '900px'}"
          :columns="gridColumns"
          :edit-field="'inEdit'"
          @rowclick="rowClick"
          @itemchange="itemChange"
          @columnreorder="columnReorder"
          :reorderable="true"
          :resizable="true"
        ></Grid>
      </div>
    </div>
  </div>
</template>

<script>
import { required, minLength } from "vuelidate/lib/validators";
import entityValidations from "@/Shared/validations";

export default {
  name: "BulkImporter",
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
      blankRows: 5,
      pastedText: "",
      modalVisible: false,
      pasteIntoRow: 1,
      editID: null,
      updatedData: [],
    };
  },
  methods: {
    // renderer(h,defaultRendering,props,listeners) {
    //   // map dataitem to this.$v.gridData[something]["something"]
    //   let invalidClass=""
    //   if ( this.$v.gridData.$each[props.dataItem.id-1][props.field].$invalid && props.dataItem[props.field] !== '') {
    //     invalidClass="invalid"
    //   }
    //   defaultRendering.data.class = invalidClass
    //   return defaultRendering
    // },
    keyPressed(e) {
      if (e.key === "Escape" || e.key === "Enter") {
        this.closeEdit();
      }
    },
    columnReorder: function (options) {
      this.gridColumns = options.columns;
    },
    rowClick: function (e) {
      this.gridData = this.gridData.map((d) => {
        d.inEdit = false;
        return d;
      });
      this.editID = e.dataItem.id;
      this.$set(e.dataItem, "inEdit", true);
    },
    closeEdit(e) {
      this.editID = null;
      this.gridData = this.gridData.map((d) => {
        d.inEdit = false;
        return d;
      });
    },
    itemChange: function (e) {
      const data = [...this.gridData]
      data[e.dataItem.id-1] = {...data[e.dataItem.id-1], [e.field]: e.value}
      this.gridData = data;
      this.$set(e.dataItem, e.field, e.value);
      this.$v.gridData.$touch();
    },

    openModal() {
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
    },
    handlePaste() {
      this.closeModal();

      const pastedRows = this.pastedText
        .split("\n")
        .map((row) => row.split(/\t/));

      const pastedHeaders = [...pastedRows[0]];
      const pastedHeaderGridColumnIndexes = pastedHeaders.map((pHeader) =>
        this.gridColumns.findIndex((h) => h.title == pHeader)
      );
      if (
        pastedRows.length === 1 ||
        pastedHeaderGridColumnIndexes.every((idx) => idx < 0)
      ) {
        return this.$store.commit("notify", {
          message:
            "You either pasted no data, no header row, or all headers are invalid. Correct and try again.",
          callback: this.openModal,
        });
      }

      pastedRows.splice(0, 1); // remove header row and any entirely blank rows
      let i = 0;
      pastedRows.forEach((row) => {
        if (row.every((c) => c === "")) {
          pastedRows.splice(i, 1);
        }
        i++;
      });
      const blankRow = {};
      this.gridColumns.forEach((c) => (blankRow[c.field] = ""));
      const totalNewRows = pastedRows.length;
      const newRowsToAdd =
        totalNewRows - (this.blankRows - this.pasteIntoRow + 1);

      // Stretch grid data to fit the rows that we need
      let gridDataCopy = [...this.gridData];
      for (let i = 1; i <= newRowsToAdd; i++) {
        gridDataCopy.push(blankRow);
      }

      let currentRow = this.pasteIntoRow - 1; // zero based index

      pastedRows.forEach((pastedRow) => {
        const thisRow = { ...gridDataCopy[currentRow] };
        let i = 0;
        pastedRow.forEach((pastedCol) => {
          const thisHeaderIdx = pastedHeaderGridColumnIndexes[i];
          if (thisHeaderIdx >= 0) {
            // check if header is valid, add to error list if not
            thisRow[this.gridColumns[thisHeaderIdx].field] = pastedCol;
            i++;
          }
        });
        gridDataCopy[currentRow] = { ...thisRow };
        currentRow++;
      });

      this.blankRows = gridDataCopy.length;
      this.gridData = gridDataCopy;
    },
    resetGrid() {
      this.selectedEntityStoreAction = "";
      this.gridData = null;
      this.gridColumns = null;
    },
    refreshGridAfterDataLoad() {
      // Does not update the store with new data

      let sampleData = {};
      let columns = [];
      switch (this.selectedEntityStoreAction) {
        // Define sampleData based on entity selected
        case "getEmployees":
          const firstRowOfData = { ...this.$store.state.employees[0] };
          const mapToTitles = {
            firstName: "First Name",
            lastName: "Last Name",
            userName: "Username",
            password: "Password",
            email: "Email",
            startDate: "Start Date",
            role: "Role",
            availableVacationHours: "Vacation Hours",
            baseRate: "Rate",
          };
          for (let field in firstRowOfData) {
            if (mapToTitles[field]) {
              columns.push({
                field: field,
                title: mapToTitles[field],
              });
              sampleData[field] = "";
            }
          }
      }

      let emptyRows = [];

      for (let i = 1; i <= this.blankRows; i++) {
        const thisDatum = { ...sampleData };
        thisDatum.id = i;
        thisDatum.inEdit = i === this.editID;
        emptyRows.push(thisDatum);
      }

      this.gridColumns = columns;
      this.gridData = emptyRows;
      //this.$v.gridData.touch();
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
  validations() {
    switch (this.selectedEntityStoreAction) {
      case "getEmployees":
        return {
          gridData: {
            required,
            $each: entityValidations.employeeValidations
          },
        };
    }
  },
};

/**
 * @todo per-entity validation
 * @todo link to backend api (obviously)
 * @todo error report on bulk paste
 */
</script>

<style>
  .invalid {
    color: red !important;
    background-color: pink !important;
  }
</style>