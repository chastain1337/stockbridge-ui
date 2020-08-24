<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.field">{{ col.title }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row,rowIndex) in data" :key="$`rw-${rowIndex}`" :data-row-index="rowIndex">
        <td
          contenteditable="true"
          @blur="cellBlurred($event,rowIndex,col.field,colIndex)"
          v-for="(col,colIndex) in columns"
          :key="`rowIndex-${col.field}`"
          :data-row-index="rowIndex"
          :data-col-index="colIndex"
          :data-cell-coordinates="`${rowIndex},${colIndex}`"
          :data-col-field="col.field"
        >{{ data[rowIndex][col.field] }}</td>
      </tr>
      <tr v-for="emptyRow in emptyRows" :key="$`rw-empt-${emptyRow}`" :data-row-index="rowIndex">
        <td
          contenteditable="true"
          @blur="cellBlurred($event,rowIndex,col.field,colIndex)"
          v-for="(col,colIndex) in columns"
          :key="`rowIndex-${col.field}`"
          :data-row-index="rowIndex"
          :data-col-index="colIndex"
          :data-cell-coordinates="`${rowIndex},${colIndex}`"
          :data-col-field="col.field"
        >{{ data[rowIndex][col.field] }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: "EditableGrid",
  props: {
    columns: Object, // title: string, field: string, editor?: defaults to text, can pass in HTML or Vue object
    data: Object, // these will be generated before the blank rows
    emptyRows: Number, // generates blank rows using the columns provided
    validations: Object, // vuelidate validations object, see /shared/validations.js for examples
  },
  methods: {
    cellBlurred(e, rowIndex, colField, colIndex) {
      console.log(`${rowIndex},${colIndex} changed to ${e.target.value}`);
    },
  },
  validations() {
    return {
      data: {
        required,
        $each: validations,
      },
    };
  },
};
</script>