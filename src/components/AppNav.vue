<template>
  <nav class="p-3 md:p-6 w-full bg-purple-200 flex flex-row">
    <div class="flex flex-grow">
      <img src="/achiever.png" alt="achiever" class="h-6 md:h-8" />
    </div>
    <button
      class="bg-purple-600 hover:bg-purple-800 text-white py-1 px-4 rounded"
      v-on:click="$emit('toggle')"
    >
      {{ fractalButtonLabel }}
    </button>
  </nav>
</template>
<script>
export default {
  props: { fractalButtonLabel: String },
};
</script>
