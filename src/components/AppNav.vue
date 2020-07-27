<template>
  <nav class="p-3 md:p-6 w-full bg-gray-300 flex flex-row">
    <div class="flex flex-grow">
      <img src="/achiever.png" alt="achiever" class="h-6 md:h-8" />
    </div>
    <router-link
      class="hover:bg-purple-300 text-purple-700 py-1 px-2 rounded"
      to="/"
    >
      Daily
    </router-link>
    <router-link
      class="hover:bg-purple-300 text-purple-700 py-1 px-2 rounded"
      to="/fractal"
    >
      Fractal
    </router-link>
  </nav>
</template>
