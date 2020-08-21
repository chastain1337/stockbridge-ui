<template>
  <div class="container-fluid mt-2">
    <k-dialog
      v-if="modalVisible"
      :modal="true"
      @close="closeModal"
      :width="800"
    >
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
        <button class="k-button" style="background-color: #81AE9D" @click="handlePaste">Insert</button>
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
      <div class="col">
        <kendo-grid
          v-if="gridData"
          :allow-copy="true"
          :editable="true"
          :height="900"
          :navigatable="true"
          :resizable="true"
          :selectable="'multiple, cell'"
          :data-source="gridData"
        >
          <kendo-grid-column
            v-for="columns in gridColumns"
            :key="columns.field"
            :title="columns.friendlyName"
            :field="columns.field"
            :encoded="false"
          ></kendo-grid-column>
        </kendo-grid>
      </div>
    </div>
  </div>
</template>

<script>
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
      pasteIntoColumn: "",
      pastedText: "",
      modalVisible: false,
      pasteIntoRow: 1,
    };
  },
  methods: {
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
      
      if (pastedRows.length === 1) {
        return this.$store.commit("notify",{ message: "You either pasted no data or no header row. Correct and try again.", callback: this.openModal })
      }

      const pastedHeaders = [...pastedRows[0]];
      pastedRows.splice(0,1); // remove header row and any entirely blank rows
      let i = 0
      pastedRows.forEach( row => {
        if (row.every( c => c === '')) { pastedRows.splice(i,1) }
        i++
      })
      const blankRow = {}
      this.gridColumns.forEach( c => blankRow[c.field] = '');
      const totalNewRows = pastedRows.length
      const newRowsToAdd = totalNewRows - ( this.blankRows - this.pasteIntoRow + 1 )
      
      // Stretch grid data to fit the rows that we need    
      let gridDataCopy = [...this.gridData]
      for (let i = 1; i <= newRowsToAdd; i++) {
        gridDataCopy.push(blankRow);
      }

      let currentRow = this.pasteIntoRow - 1 // zero based index
    
      pastedRows.forEach( pastedRow => {
          const thisRow = {...gridDataCopy[currentRow]}
          let i = 0;
          pastedRow.forEach( pastedCol => {
            const thisHeader = pastedHeaders[i];
            const gridColumnsIndex = this.gridColumns.findIndex( c => c.friendlyName === thisHeader)
            if (gridColumnsIndex >= 0 ) { // check if header is valid, add to error list if not
              const realColumnName = this.gridColumns[gridColumnsIndex].field;
              thisRow[realColumnName] = pastedCol;
              i++;
            }
          })
          gridDataCopy[currentRow] = {...thisRow}
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
          const mapToFriendlyNames = {
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
            if (mapToFriendlyNames[field]) {
              columns.push({
                field: field,
                friendlyName: mapToFriendlyNames[field],
              });
              sampleData[field] = "";
            }
          }
      }

      let emptyRows = [];

      for (let i = 1; i <= this.blankRows; i++) {
        emptyRows.push(sampleData);
      }

      this.gridColumns = columns;
      this.gridData = emptyRows;
      this.pasteIntoColumn = columns[0].field;
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