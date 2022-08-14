<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { KeySharp, PersonSharp } from '@vicons/ionicons5'
import { AuthorizationEntity } from './models'

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'authorizationChanged', value: AuthorizationEntity): void
}>()

const strings = {
  jenkinsUsernameInputPlaceholder: 'Jenkins username',
  jenkinsPasswordInputPlaceholder: 'Jenkins password or api token',
}

const authorizationEntity = reactive(new AuthorizationEntity())

watch(authorizationEntity, (newVal: AuthorizationEntity) => {
  emit('authorizationChanged', newVal)
})
</script>

<template>
  <div id="api-tool-panel-authorization">
    <n-input
      v-model:value="authorizationEntity.username"
      :placeholder="strings.jenkinsUsernameInputPlaceholder"
      :title="strings.jenkinsUsernameInputPlaceholder"
    >
      <template #prefix>
        <n-icon :component="PersonSharp" />
      </template>
    </n-input>
    <n-input
      v-model:value="authorizationEntity.password"
      type="password"
      show-password-on="click"
      :placeholder="strings.jenkinsPasswordInputPlaceholder"
      :title="strings.jenkinsPasswordInputPlaceholder"
      class="mt-10px"
    >
      <template #prefix>
        <n-icon :component="KeySharp" />
      </template>
    </n-input>
    <n-checkbox
      v-model:checked="authorizationEntity.crumbFlag"
      label="Whether CSRF protection is enabled"
      class="mt-10px"
    />
  </div>
</template>

<style lang="scss">
#api-tool-panel-authorization {
  .full-width {
    width: 100%;
  }
}
</style>
