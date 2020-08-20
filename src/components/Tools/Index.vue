<template>
    
    <div class="container mt-5 toolsgrid text-center">
        <div class="row">
            <div class="col">
                <router-link to="/Tools/BulkImporter" tag="div" class="tool">
                    Bulk Importer
                </router-link>
            </div>
            <div class="col">
                <div class="tool" >
                    Another Tool
                </div>
            </div>
        </div>
    </div>

</template>

<script>
export default {
    name: "Tools"
}
</script>

<style scoped>
    .tool {
        height: 200px;
        border: 2px solid black;
        font-size: 20px;
        padding-top: 75px;
    }

    .tool:hover {
        background-color: #CCCCCC;
        cursor: pointer;
    }

    .toolsgrid {

    }
</style>