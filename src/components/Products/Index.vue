<template>
    
        <div class="container-fluid">
            <div class="row mt-3">
                <div class="col-3">
                    <div class="input-group">
                        <input class="form-control" v-model="searchedSKU" placeholder="SKU..." />
                        <div class="input-group-append">
                            <kendo-button icon="search" type="button" @click="loadProductData"></kendo-button>
                        </div>
                    </div>
                </div>
                <div class="col-4">
                    <kendo-button class="mx-1" title="Field selector..." icon="file-add" @click="handleOpen"></kendo-button>
                    <kendo-button class="mx-1" title="Save field settings" icon="save" @click="handleSaveSettings"></kendo-button>
                </div>
            </div>
        
            
        <div class="mt-3">
            <div v-if="fields">
                <card v-for="field in fields" v-show="field.visible" :data-field="field.field" :key="field.field" :field="field" ref="fields"></card>
            </div>
            <div v-else style="font-size: 14pt">
                <div style="width: 14pt; height: 14pt;" class="spinner-border" role="status"></div> 
                Fetching default field settings...
            </div>
        </div>
        
        <k-dialog
            v-show="showFieldEditor"
            id="product-view-field-editor"
            :modal="true"
            @close="handleClose"
            :width="900"
            :height="500"
            title="Field Chooser"
            >
            <div>
                <table class="table table-bordered table-sm table-hover">
                    <thead>
                    <tr>
                        <td>Field</td>
                        <td>Show</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="field in fields" :key="field.field" @click="toggleFieldVisible(field)" :class="field.visible ? null : 'hidden-field'">
                        <td class="align-middle">{{field.title}}</td>
                        <td class="align-middle">{{ field.visible ? "Yes" : "No" }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <dialog-actions-bar>
                <button class="k-button" style="background-color: #dddddd" @click="handleClose">Close</button>
            </dialog-actions-bar>
        </k-dialog>


        </div>
</template>

<script>
import Card from "@/Components/Products/Card"
import sbHttp from "@/Shared/sbHttp"
import entityData from "@/Shared/gridEntityData"

export default {
    name: 'Products',
    components: {card: Card},
    data() {
        return {
            searchedSKU: "",
            fields: null,
            showFieldEditor: false,
            loadedProduct: null
        }
    },
    methods: {
        loadProductData() {
            const product = this.$store.state.entities.products.data.filter( p => p.sku === this.searchedSKU)[0]
            console.log(product);
            if (product) {
                const fields = [...this.fields]
                fields.forEach( field => {
                    field.value = product[field.field]
                });
                this.fields = fields;
            } else {
                return sb.notify.toast("No product found.",1500,"F");
            }
        },
        toggleFieldVisible(field) {
            const idx = this.fields.findIndex( f => f.field === field.field);
            const fields = [...this.fields];
            const thisField = {...fields[idx]}
            if (thisField.visible) {
                thisField.visible = false;
            } else {
                thisField.visible = true
            }
            fields[idx] = {...thisField}
            this.fields = [...fields];
        },
        handleClose() {
            this.showFieldEditor = false;
        },
        handleOpen() {
            this.showFieldEditor = true;
        },
        async handleSaveSettings() {

            function pxToNum(val) {
                return Number(val.replace("px",""))
            }
            
                const cardStats = this.$refs.fields.map( r => {
                    return {
                        field: r.$el.dataset.field, 
                        width: r.$el.style.width, 
                        height: r.$el.style.height, 
                        x: r.$el.style.left, 
                        y: r.$el.style.top 
                    }
                });
                const upsertObject = this.fields.map( field => {
                    const thisStat = cardStats[cardStats.findIndex( stat => stat.field === field.field)]
                    return { Field: field.field, X: pxToNum(thisStat.x), Y: pxToNum(thisStat.y), Width: pxToNum(thisStat.width), Height: pxToNum(thisStat.height), Visible: field.visible }
                });
                console.log(upsertObject);
                await sbHttp.post_notify("api/Product/UpsertProductViewSettings",upsertObject,"Settings saved!")
            
        }
    },
    async mounted() {
        //Fetch the default settings
        
        await this.$store.dispatch("getProducts")
        const settingsRes = await sbHttp.get_notify("api/Product/GetProductViewSettings",null,"Could not fetch default field settings for this account.")
        
        const productFields = entityData.products.fields
        let fields = []

        let width = 200, height = 100, x = 15-width, y = 134-height
        for (let key in productFields) {
            const idxOfThisViewSetting = settingsRes.data ? settingsRes.data.findIndex( vs => vs.field === key) : -1;
            let thisViewSetting = {}
            if (idxOfThisViewSetting > -1) {
                thisViewSetting = settingsRes.data[idxOfThisViewSetting]
            } else {
                thisViewSetting = { width: width, height: height, x: x+width, y: y+height, visible: true}
                if (y + height + 15 > 450) {
                    y = 134-height
                    x += width + 15
                } else {
                    y += height + 15
                }
            }
            
            fields.push({field: key, title: productFields[key].friendlyName, value: null, x: thisViewSetting.x, y: thisViewSetting.y, width: thisViewSetting.width, height: thisViewSetting.height, visible: thisViewSetting.visible });
            this.fields = fields
        }
        
        
    },
    computed: {
        }
}
</script>

<style scoped>
    tr:hover {
        cursor: pointer;
    }

    .hidden-field {
        color: darkgray;
    }
</style>