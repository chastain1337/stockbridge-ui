<template>
  <form>
    <kendo-button
      class="k-button-flat"
      title="Back"
      icon="arrow-chevron-left"
      @click="() => $emit('back-click')"
      >Back</kendo-button
    >
    <div class="form-group">
      <label for="friendlyNameInput">Friendly Name</label>
      <input
        type="text"
        class="form-control"
        :class="$v.friendlyName.$invalid ? 'is-invalid' : ''"
        id="friendlyNameInput"
        placeholder="Friendly Name..."
        v-model="friendlyName"
      />
      <input
        class="form-control form-control-sm"
        type="text"
        placeholder="System Name"
        v-model="systemName"
        readonly
      />

      <label for="descInput">Description</label>
      <input
        type="text"
        class="form-control"
        :class="$v.description.$invalid ? 'is-invalid' : ''"
        id="descInput"
        placeholder="Description..."
        v-model="description"
      />

      <label for="valueInput">Value</label>
      <input
        type="text"
        class="form-control mb-2"
        :class="$v.value.$invalid ? 'is-invalid' : ''"
        id="valueInput"
        placeholder="Value..."
        v-model="value"
      />

      <kendo-button
        type="button"
        key="saveCustomFieldUpsertChangesButton"
        class="mx-1"
        title="Save changes"
        :disabled="$v.$invalid"
        icon="save"
        @click="handleSave"
        >{{ prepopulatedCustomField ? "Update" : "Add" }}</kendo-button
      >
      <kendo-button
        type="button"
        class="mx-1"
        title="Cancel changes"
        icon="cancel"
        @click="() => $emit('back-click')"
        >Cancel</kendo-button
      >
    </div>
  </form>
</template>

<script>
import allValidations from "@/Shared/validations";
export default {
  name: "CustomFieldsUpsertForm",
  props: { prepopulatedCustomField: Object },
  methods: {
    handleSave() {
      // validate

      this.$emit("saveClick", {
        friendlyName: this.friendlyName,
        systemName: this.systemName,
        description: this.description,
        value: this.value,
        id: this.id,
      });
    },
  },
  data() {
    return {
      friendlyName: this.prepopulatedCustomField
        ? this.prepopulatedCustomField.friendlyName
        : "",
      value: this.prepopulatedCustomField
        ? this.prepopulatedCustomField.value
        : "",
      description: this.prepopulatedCustomField
        ? this.prepopulatedCustomField.description
        : "",
      id: this.prepopulatedCustomField ? this.prepopulatedCustomField.id : -1,
    };
  },
  computed: {
    systemName() {
      return this.friendlyName.replace(/ /g, "");
    },
  },
  validations() {
    return allValidations.customFieldValidations;
  },
};
</script>

<style scoped>
</style>