<template>
    <h3>WELCOME</h3>
</template>
<script setup>
import { onMounted } from 'vue';
import { getUserInfo } from '@/api/Home';


// 初始化验证码
onMounted(() => {
  getUserInfo().then(res => {
    console.log(res)
  })
});

</script>
<style>

</style>