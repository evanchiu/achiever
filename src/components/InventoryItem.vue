<template>
  <div class="w-full">
    <div class="text-gray-600">{{ item.total }} {{ item.name }}</div>
    <ul class="pl-4 text-sm text-gray-500">
      <li v-for="source in Object.keys(item.counts)" :key="source">
        {{ item.counts[source] }} {{ source }}
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
};
</script>
