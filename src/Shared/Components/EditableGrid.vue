Using this component:
  - Register it in the parent
  - Pass in the props as detailed below
  - In the parent you need to handle @dataChange:. 
    - This event passes in a new data array (includes blank rows as data)
    - You must at least:
      -Set your local totalRows field to max(data.length,current totalRows) 
      -Set local data = data parameter that was passed in.



<template>
  <div class="container-fluid">
    <div class="row text-center border-bottom pb-3 border-dark">
      <div class="col-2" v-if="buttonsToInclude.includes('ROWCOUNT') || buttonsToInclude.includes('ALL')">
        Total Rows:
        <kendo-numerictextbox
          class="ml-2"
          v-model.number="totalRowsLocal"
          :max="500"
          :min="1"
          :decimals="0"
          :format="'#'"
          :disabled="!!this.allData"
        ></kendo-numerictextbox>
      </div>
      <div class="col-1" v-if="buttonsToInclude.includes('SUBMIT') || buttonsToInclude.includes('ALL')">
        <button class="btn btn-success" @click="handleSubmit" :disabled="!allData || !valid || submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm"></span>
          <span v-else>Submit</span>
        </button>
      </div>
      <div class="col-1" v-if="buttonsToInclude.includes('VALIDATE') || buttonsToInclude.includes('ALL')" >
        <button class="btn btn-warning" @click="handleValidate" :disabled="!this.allData">Validate</button>
      </div>
      <div class="col-1" v-if="buttonsToInclude.includes('COPY') || buttonsToInclude.includes('ALL')" >
       <button class="btn btn-primary" @click="handleCopy" :disabled="!this.allData">Copy</button>
      </div>
      <div class="col-1" v-if="buttonsToInclude.includes('CLEAR') || buttonsToInclude.includes('ALL')">
        <button class="btn btn-danger" @click="handleClear" :disabled="!this.allData">Clear</button>
      </div>
    </div >
    <div class="row" v-if="!!this.allData">
      <table class="table table-bordered table-sm table-hover table-striped" id="editable-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.field">{{ col.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row,rowIndex) in allData" :key="`rw-${rowIndex}`" :data-row-index="rowIndex">
            <td
              v-for="(col,colIndex) in columns"
              @paste="handlePaste"
              @blur="cellBlurred($event.target.textContent,rowIndex,col.field,colIndex)"
              @keydown="handleKeyPress($event,$event.target.textContent,rowIndex,col.field,colIndex)"
              @focus="handleFocus(rowIndex,col.field,colIndex,$event.target.textContent,$event)"
              :key="`${rowIndex}-${col.field}-${allData[rowIndex][col.field]}`"
              :data-row-index="rowIndex"
              :data-col-index="colIndex"
              :data-cell-coordinates="`${rowIndex},${colIndex}`"
              :data-col-field="col.field"
              :contenteditable="col.readOnly ? 'false' : 'true'"
            >
              <template v-if="col.readOnly && col.calculation">{{col.calculation(row)}}</template>
              <template v-else-if="allData[rowIndex][col.field] != null">{{allData[rowIndex][col.field]}}</template>
              <br v-else />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import gridEntityData from "@/Shared/gridEntityData";
import notify from "@/Shared/notify"

export default {
  name: "EditableGrid",
  data() {
    return {
      allData: null,
      totalRowsLocal: this.totalRows,
      valid: false
    };
  },
  props: {
    entityData: {required: true, type: Object},
    //columns: {required: true }, // column object from gridEntityData.js
    data: { required: true }, // must pass in empty array if only blank rows
    totalRows: { type: Number, required: true }, // generates blank rows after data rows using the columns provided. Sets the initial value of the selector (see enableRowCountEdit)
    validations: Object, // vuelidate validations object, see /shared/validations.js for examples
    enableBulkPaste: { type: Boolean, default: false }, // whether paste events should be auto-parsed and spread across the grid
    buttonsToInclude: {type: Array, default: []}, // toolbar buttons to include. Valid values are: "ROWCOUNT","SUBMIT","VALIDATE","COPY","CLEAR". Can also use "ALL" to enable all buttons
    submitHandler: Function, // only required if including submit button, the callback action to perform in the parent component when "Submit" is clicked. Note that the current data is not passed up because it the two components are guaranteed to have data in sync
    submitting: Boolean
  },
  methods: {
    calculateColumn(row,calculation) {
      const newVal = calculation(row);
      return newVal;
    },
    handleSubmit(e) {
      this.submitHandler();
    },
    handleCopy() {
      // convert grid to text
      const tabDelimited = this.allData.map( dataObj => Object.values(dataObj).join("\t"));
      const newLine = tabDelimited.join("\n");
      navigator.clipboard.writeText(newLine).then( () => { 
        notify.toast("Copied!",1000)
      }, () => {
        notify.toast("Failed to copy.",2000)
      } );
    },
    handleValidate() {
      let validFlag = true;
      const table = document.getElementById("editable-table");
      for (let row = 0; row < this.allData.length; row++) {
        const smushedData = Object.values(this.allData[row]).join('')
        if (this.$v.allData.$each[row].$invalid && smushedData.length > 0) {
          validFlag = false;
          // Loop through columns and check valid, change tds based on that
          let colIdx = 0
          this.columns.forEach( col => {
            if (this.$v.allData.$each[row][col.field].$invalid && this.$v.allData.$each[row][col.field].$model) {
              table.rows[row+1].cells[colIdx].style.backgroundColor = "red";
            }
            colIdx++
          });
        }
      }
      this.valid = validFlag
    },
    handleClear() {
      this.updateParent(this.emptyRows(this.totalRowsLocal))
    },
    handlePaste(e) {
      if (!this.enableBulkPaste) return;
      e.stopPropagation();
      e.preventDefault();

      // Get pasted data via clipboard API
      const clipboardData = e.clipboardData || window.clipboardData;
      let pastedData = clipboardData
        .getData("Text")
        .split("\n")
        .map((row) => row.split(/\t/));
      const startingColField = e.target.getAttribute("data-col-field");
      const startingColIndex = Number(e.target.getAttribute("data-col-index"));
      const startingRow = Number(e.target.getAttribute("data-row-index"));

      // Make sure we are not pasting into readOnly col
      for (let i = startingColIndex; i < startingColIndex+pastedData[0].length; i++) {
        if (this.columns[i].readOnly) {
          return notify.popup({message: `You are attempting to paste into the ${this.columns[i].title} column, which is Read-Only and therefore cannot be modified.`});
        }
      }

      // Remove any completely blank rows
      pastedData = pastedData.filter((row) => row.every((cell) => cell !== ""));

      // Make sure data fits in columns
      const remainingColumns = this.columns.length - startingColIndex;
      if (pastedData[0].length > remainingColumns) {
        return notify.popup({message: `You have pasted ${pastedData[0].length} columns in a space where only ${remainingColumns} can be filled.`})       
      }

      // Strech all data to fit rows
      const rowsToAdd =
        startingRow + pastedData.length - 1 - this.allData.length;
      let newData = [...this.allData];
      if (rowsToAdd > 0) {
        const emptyRows = this.emptyRows(rowsToAdd);
        newData = [...this.allData, ...emptyRows];
      }

      let currentRow = startingRow;
      pastedData.forEach((pastedRow) => {
        const thisRow = { ...newData[currentRow] };
        let i = 0;
        pastedRow.forEach((pastedCol) => {
          const colHeader = this.columns[startingColIndex + i].field;
          thisRow[colHeader] = pastedCol;
          i++;
        });

        newData[currentRow] = { ...thisRow };
        
        currentRow++;
      });

      this.totalRowsLocal = newData.length;
      this.updateParent(newData);
    },
    handleFocus(rowIndex,colField,colIndex,textContent,e) {
      document.execCommand('selectall',false,null);
    },
    handleKeyPress(e,newValue,rowIndex,colField,colIndex) {
      if (e.key === "Tab") {
        e.preventDefault();
        e.target.blur();
        // select first cell of next row if on last column
        if (colIndex === this.columns.length-1) {
          document.getElementById("editable-table").rows[rowIndex+2].cells[0].focus();
        } else {
          document.getElementById("editable-table").rows[rowIndex+1].cells[colIndex+1].focus();
        }
        
        document.execCommand('selectall',false,null);
      }
    },
    cellBlurred(newValue, rowIndex, colField, colIndex) {
      if (this.allData[rowIndex][colField] !== newValue && newValue !== "") {
        this.valid = false;
        const row = { ...this.allData[rowIndex] };
        const dataCopy = [...this.allData];
        row[colField] = newValue;
        if (this.entityData.watch) {
          if (Object.keys(this.entityData.watch).includes(colField)) {
          for (let key in this.entityData.watch[colField]) {
            row[key] = this.entityData.watch[colField][key](row)
          }
        }
        }
        

        dataCopy[rowIndex] = row;

        this.updateParent(dataCopy);
      }
    },
    emptyRows(count = 1) {
      let emptyRow = {};
      this.columns.forEach((col) => (emptyRow[col.field] = null));
      return Array(count).fill({ ...emptyRow }); // I know, I know...
    },
    createAllData() {
      const emptyRows = this.emptyRows(Math.max(this.totalRows,this.totalRowsLocal) - this.data.length);
      const dataCopy = [...this.data, ...emptyRows];

      // Iterdate dataCopy and apply calculations to initialize data properly to only fields that are not BOTH calculated and read-only
      this.columns.filter( c => c.calculation).forEach( column => {
        let i = 0;
        dataCopy.forEach( rowRef => {
          const row = {...rowRef}
          row[column.field] = column.calculation(row);
          dataCopy[i] = {...row}
          i++
        })
      });
      this.allData = dataCopy;
    },
    updateParent(newData) {
      this.$emit("dataChange", newData);
    },
  },
  mounted() {
    if (this.data) this.createAllData();
  },
  watch: {
    data() {
      if (this.data === null) return this.allData = null;
      this.createAllData();
    },
  },
  validations() {
    if (!this.validations) return {};
    return {
      allData: {
        required,
        $each: this.validations,
      },
    };
  },
  computed: {
    columns() {
      let columns = []
      const entityDataFields = {...this.entityData.fields};

      for (let field in entityDataFields) {
        if (!entityDataFields[field].hidden ) {
          columns.push({
                field: field,
                title: entityDataFields[field].friendlyName,
                readOnly: !!entityDataFields[field].readOnly,
                calculation: entityDataFields[field].calculation || null
              });
        }
      }
    
      return columns
    }
  }
};
</script>

<style scoped>
td {
  line-height: 1;
}
</style>