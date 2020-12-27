<template>
  <div id="api-tool-panel-authorization">
    <v-container>
      <v-text-field
        v-model="username"
        dense
        label="Username"
        :placeholder="strings.jenkinsUsernameInputPlaceholder"
        :title="strings.jenkinsUsernameInputPlaceholder"
        hide-details
        outlined
      ></v-text-field>

      <v-text-field
        v-model="password"
        dense
        label="Password"
        :placeholder="strings.jenkinsPasswordInputPlaceholder"
        :title="strings.jenkinsPasswordInputPlaceholder"
        class="mt-2"
        hide-details
        type="password"
        outlined
      ></v-text-field>

      <v-checkbox
        v-model="useCrumb"
        dense
        hide-details
        label="Use Crumb"
      ></v-checkbox>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  name: 'PanelAuthorization'
})
export default class PanelAuthorization extends Vue {
  strings = {
    jenkinsUsernameInputPlaceholder: 'Jenkins username (Optional)',
    jenkinsPasswordInputPlaceholder: 'Jenkins password or api token (Optional)',
  }
  username = ''
  password = ''
  useCrumb = true
}
</script>

<style lang="scss">
#api-tool-panel-authorization {
  .full-width {
    width: 100%;
  }
}
</style>
