import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
app.use(router);
app.config.globalProperties.append = (path, pathToAppend) =>
  path + (path.endsWith("/") ? "" : "/") + pathToAppend;
app.mount("#app");
