<template>
    <div class="container mt-3">
        <h1>My Account</h1>
        <button class="btn btn-sm btn-dark mb-2" @click=handleLogout>Log Out</button>
        <table class="table table-bordered table-hover table-sm w-50">
            <thead>
                <th>Property</th>
                <th>Value</th>
            </thead>
            <tbody>
                <tr v-for="prop in friendlyUser" :key="prop.friendlyName" >
                    <td>{{prop.friendlyName}}</td>
                    <td>{{ prop.value }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: "MyAccount",
    computed: {
        friendlyUser() {
            const user = this.$store.state.loggedInEmployee
            return [
                {friendlyName: "Employee ID", value: user.id},
                {friendlyName: "First Name", value: user.firstName},
                {friendlyName: "Last Name", value: user.lastName},
                {friendlyName: "Username", value: user.userName}
            ]
        }
    },
    methods: {
    handleLogout() {
      this.$store.commit("clear_login");
      this.$router.push("/Login");
    },
    }
}
</script>

<style scoped>
</style>