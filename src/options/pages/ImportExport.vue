<template>
  <div id="options-import-export-wrapper">
    <v-container>
      <div
        class="mx-auto"
        style="max-width: 900px;"
      >
        <v-row>
          <v-col cols="6">
            <v-hover v-slot:default="{ hover }">
              <v-card
                ripple
                height="200"
                :elevation="hover ? 6 : 2"
                :class="[{ 'on-hover': hover }, 'pointer-cursor']"
              >
                <v-card-title>{{ strings.importSettings }}</v-card-title>
                <v-card-text>
                  <v-icon
                    size="86"
                    class="icon-center"
                  >
                    mdi-import
                  </v-icon>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-col>

          <v-col cols="6">
            <v-hover v-slot:default="{ hover }">
              <v-card
                ripple
                height="200"
                :elevation="hover ? 6 : 2"
                :class="[{ 'on-hover': hover }, 'pointer-cursor']"
              >
                <v-card-title>{{ strings.exportSettings }}</v-card-title>
                <v-card-text>
                  <v-icon
                    size="86"
                    class="icon-center"
                  >
                    mdi-export
                  </v-icon>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <p class="text--secondary">
              {{ strings.exportSettingsTip }}
            </p>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class ImportExport extends Vue {
  strings = {
    exportSettingsTip: browser.i18n.getMessage('exportSettingsTip'),
    importSettings: browser.i18n.getMessage('importSettings'),
    exportSettings: browser.i18n.getMessage('exportSettings'),
    settingsImported: browser.i18n.getMessage('settingsImported'),
    settingContentIsEmpty: browser.i18n.getMessage('settingContentIsEmpty'),
    settingsFileParsingFailed: browser.i18n.getMessage('settingsFileParsingFailed'),
    settingsFileContentIncorrect: browser.i18n.getMessage('settingsFileContentIncorrect'),
  }
  settingsKeyName = 'jenkins-helper'
  disableExportBtn = false
  disableImportBtn = false

}
</script>

<style lang="scss">
#options-import-export-wrapper {
  .pointer-cursor {
    cursor: pointer;

    .icon-center {
      width: 100%;
      height: 100%;
      text-align: center;
    }
  }
}
</style>
