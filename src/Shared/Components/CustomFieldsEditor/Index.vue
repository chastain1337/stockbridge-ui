<template>
    
<k-dialog
    v-show="true"
    id="custom-fields-editor"
    :modal="true"
    @close="handleCloseWithoutSaving"
    :width="900"
    :height="600"
    :title="`Custom Fields for ${friendlyIdentifier}`"
    >
    <div v-if="!showUpsertForm">
        <h6 class="alert-warning p-3 m-2 text-center" v-if="unsavedChangesInParent">There are unsaved changes on the main product. If you save changes here you will lose those changes. Save the main product first before making changes here.</h6>
        <table class="table table-sm table-bordered table-striped">
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Value</th>
                <th>Actions</th>
            </tr>
            <tr v-for="(cf,i) in customFieldsLocal" v-show="!cf.deleteFlag" :key="cf.systemName">
                <td class="align-middle">{{cf.friendlyName}}</td>
                <td class="align-middle">{{cf.description}}</td>
                <td class="align-middle">{{cf.value}}</td>
                <td class="text-center align-middle">
                    <kendo-button class="mr-1" icon="pencil" type="button" title="Edit" @click="handleEditCustomFieldClick(i)"/>
                    <kendo-button icon="delete" type="button" title="Delete" @click="handleDeleteCustomFieldClick(i)" />
                </td>
            </tr>
        </table>
        <div class="text-center">
            <kendo-button icon="add" type="button" title="New Custom Field..." @click="handleAddCustomFieldClick" />
        </div>
    </div>

    <dialog-actions-bar  v-if="!showUpsertForm">
        <button class="k-button" :style="`background-color: ${unsavedChanges ? 'lightgreen' :'#dddddd'}`" @click="handleBigSave">Save Changes</button>
        <button class="k-button" :style="`background-color: ${unsavedChanges ? 'pink' :'#dddddd'}`" @click="handleCloseWithoutSaving">{{`Close${unsavedChanges ? ' and undo Changes' : ''}`}}</button>
    </dialog-actions-bar>
    
    <CustomFieldsUpsertForm v-if="showUpsertForm" :prepopulatedCustomField="prepopulatedCustomField" @back-click="() => showUpsertForm = false" @saveClick="handleSaveUpsertCustomFieldClick"/>
</k-dialog>

</template>

<script>
import sbHttp from '@/Shared/sbHttp';
import CustomFieldsUpsertForm from "./CustomFieldsUpsertForm"

export default {
    name: "CustomFieldsEditor",
    props: {
        showModal: Boolean,
        friendlyIdentifier: String, // SKU, vendor code, etc.
        identifier: Number, // foreign ID,
        identifierType: String, // must match exactly to model on server, productID, vendorID, etc.
        customFields: Array,
        unsavedChangesInParent: Boolean
    },
    components: {
        CustomFieldsUpsertForm
    },
    computed: {
    
    },
    data() {
        return {
            showUpsertForm: false,
            prepopulatedCustomField: null,
            customFieldsLocal: [...this.customFields],
            unsavedChanges: false
        }
    },
    methods: {
        handleCloseWithoutSaving() {
            this.customFieldsLocal = [...this.customFields];
            this.$emit('close',false);
        },
        async handleBigSave() {
            console.log(this.customFieldsLocal)
            // Call to API to update
            await sbHttp.post_notify("api/Product/UpsertProductCustomFields",[...this.customFieldsLocal]);

            // Force full refresh of products
            await this.$store.dispatch("getProducts",true);

            //Close modal
            this.$emit('close',true);
        },
        handleEditCustomFieldClick(i) {
            this.prepopulatedCustomField = {...this.customFieldsLocal[i]};
            this.showUpsertForm = true;
        },
        handleDeleteCustomFieldClick(i) {
            const cfsCopy = [...this.customFieldsLocal ];
            
            // If custom field has already been saved to db, set DeleteFlag so it will be updated, otherwise you can just splice it.
            if (cfsCopy[i].id !== -1) {
                cfsCopy[i].deleteFlag = true;
            } else {
                cfsCopy.splice(i,1);
            }
            

            this.unsavedChanges = true;
            this.customFieldsLocal = cfsCopy;
        },
        handleAddCustomFieldClick() {
            this.prepopulatedCustomField = null;
            this.showUpsertForm = true;
        },
        handleSaveUpsertCustomFieldClick(cfObject) {

            // Check for duplicate custom fields
            

            const cfsCopy = [...this.customFieldsLocal ];
            
            if (cfObject.id === -1) {
                if (this.customFieldsLocal.findIndex(cf => cf.systemName === cfObject.systemName && cf.deleteFlag === false) > -1) {
                    return sb.notify.toast("A custom field with this name already exists.",2000,"F");
                }

                const newCfObject = {description: cfObject.description, friendlyName: cfObject.friendlyName, systemName: cfObject.systemName, value: cfObject.value}
                newCfObject[this.identifierType] = this.identifier;  // productID = 1002, vendorID = 24, etc.
                cfsCopy.push(newCfObject);
            } else {
                const cfObjectIndex = cfsCopy.findIndex( cf => cf.id === cfObject.id);
                if (cfObjectIndex > -1) {
                    cfsCopy[cfObjectIndex] = {
                        ...cfsCopy[cfObjectIndex],
                        description: cfObject.description,
                        friendlyName: cfObject.friendlyName,
                        systemName: cfObject.systemName,
                        value: cfObject.value 
                    };
                }
            }
            this.customFieldsLocal = cfsCopy;
            this.unsavedChanges = true;
            this.showUpsertForm = false;
        }

    }
}
</script>

<style scoped>

</style>