<template>
    <div>
        <div class="contain">
            <router-view />
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="css" scoped>
.contain{
    overflow-y: auto;
    height: calc(100vh - 56px);
    background-color: #121212;
}

</style>