import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  eslintConfigPrettier,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      // override/add rules settings here, such as:
      // 'vue/no-unused-vars': 'error'
    }
  }
]