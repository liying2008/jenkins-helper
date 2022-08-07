<script lang="ts" setup>
import { watch } from 'vue'
import type { AuthorizationEntity } from './models'

const props = defineProps<{
  authorizationEntity: AuthorizationEntity
}>()

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'authorizationChanged', value: AuthorizationEntity): void
}>()

const strings = {
  jenkinsUsernameInputPlaceholder: 'Jenkins username',
  jenkinsPasswordInputPlaceholder: 'Jenkins password or api token',
}
// 是否显示密码
const showPassword = false

watch(props.authorizationEntity, (newVal: AuthorizationEntity) => {
  emit('authorizationChanged', newVal)
})
</script>

<template>
  <div id="api-tool-panel-authorization">
    <v-container>
      <v-text-field
        v-model="authorizationEntity.username"
        dense
        label="Username"
        :placeholder="strings.jenkinsUsernameInputPlaceholder"
        :title="strings.jenkinsUsernameInputPlaceholder"
        hide-details
        outlined
      ></v-text-field>

      <v-text-field
        v-model="authorizationEntity.password"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        dense
        label="Password"
        :placeholder="strings.jenkinsPasswordInputPlaceholder"
        :title="strings.jenkinsPasswordInputPlaceholder"
        class="mt-2"
        hide-details
        :type="showPassword ? 'text' : 'password'"
        outlined
        @click:append="showPassword = !showPassword"
      ></v-text-field>

      <v-checkbox
        v-model="authorizationEntity.useCrumb"
        dense
        hide-details
        label="Use Crumb"
      ></v-checkbox>
    </v-container>
  </div>
</template>

<style lang="scss">
#api-tool-panel-authorization {
  .full-width {
    width: 100%;
  }
}
</style>
