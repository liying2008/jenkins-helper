<template>
  <div>
    <p>{{ defaultText }}</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'HelloWorld',
  computed: {
    defaultText() {
      return browser.i18n.getMessage('extName')
    }
  },
  mounted() {
    browser.runtime.sendMessage({})
  }
})
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
