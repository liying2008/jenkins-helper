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
                :disabled="disableImportBtn"
                @click="importSettings"
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
                :disabled="disableExportBtn"
                @click="exportSettings"
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
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
      >
        {{ snackbar.message }}

        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="snackbar.show = false"
          >
            {{ strings.close }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
    <!--隐藏的文件上传输入框-->
    <input
      id="configFile"
      ref="configFile"
      type="file"
      name="configFile"
      value=""
      accept="application/json"
      style="display: none"
      @change="readFile($event)"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { StorageService } from '@/libs/storage'
import { Tools } from '@/libs/tools'
import { SettingsFileData } from '@/models/settings-file'
import { MessageColor } from '@/models/message'

@Component
export default class ImportExport extends Vue {
  strings = {
    close: browser.i18n.getMessage('close'),
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
  snackbar = {
    show: false,
    message: '',
    color: MessageColor.Success,
  }


  /**
   * 导入设置
   */
  importSettings() {
    this.triggerUpload()
  }

  /**
   * 导出设置
   */
  exportSettings() {
    this.disableExportBtn = true
    StorageService.get([StorageService.keyForJenkinsUrl, StorageService.keyForNodes, StorageService.keyForOptions]).then((result) => {
      browser.management.getSelf().then((extensionInfo) => {
        console.log('extensionInfo', extensionInfo)
        const fileContent = {
          name: this.settingsKeyName,
          version: extensionInfo!.version,
          data: result
        }
        console.log('fileContent', fileContent)
        const filename = 'jenkins-helper_settings_' + Tools.getReadableTime(Date.now(), false) + '.json'
        // 开始下载
        this.triggerDownload(filename, JSON.stringify(fileContent))
        this.disableExportBtn = false
      })
    })
  }

  /**
   * 触发下载文件
   * @param filename 文件名
   * @param content 文件内容
   */
  triggerDownload(filename: string, content: string) {
    const element = document.createElement('a')
    element.download = filename
    element.style.display = 'none'
    const blob = new Blob([content])
    element.href = URL.createObjectURL(blob)
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  /**
   * 触发上传文件
   */
  triggerUpload() {
    const inputElement: any = this.$refs.configFile
    inputElement.value = ''
    inputElement.click()
  }

  /**
   * 读取文件内容
   * @param event
   */
  readFile(event: Event) {
    // console.log('event', event)
    const inputElement: any = this.$refs.configFile
    const filePath = inputElement.value
    console.log('filePath', filePath)
    if (filePath) {
      const reader = new FileReader()
      reader.readAsText(inputElement.files[0], 'utf-8')

      reader.onload = () => {
        // console.log('加载成功')
        // console.log('reader.onload', reader)
      }
      reader.onloadstart = () => {
        // console.log('开始加载')
        // console.log('reader.onloadstart', reader)
      }
      reader.onloadend = () => {
        // console.log('加载结束')
        // console.log('reader.onloadend', reader)
        // 开始导入
        this.startImport(reader.result as string)
      }
    }
  }

  /**
   * 开始导入
   * @param content settings文件内容
   */
  startImport(content: string) {
    let settings: SettingsFileData
    try {
      settings = JSON.parse(content)
    } catch (e) {
      console.log(e)
      this.showDangerMessage(this.strings.settingsFileParsingFailed)
      return
    }
    console.log('settings', settings)
    if (settings.name !== this.settingsKeyName) {
      this.showDangerMessage(this.strings.settingsFileContentIncorrect)
      return
    }
    if (!settings.data || Object.getOwnPropertyNames(settings.data).length === 0) {
      this.showSuccessMessage(this.strings.settingContentIsEmpty)
      return
    }
    StorageService.set(settings.data).then(() => {
      this.showSuccessMessage(this.strings.settingsImported)
    })
  }

  /**
   * 显示成功信息
   * @param successText 信息文本
   */
  showSuccessMessage(successText: string) {
    // console.log('showSuccessMessage')
    this.snackbar = {
      show: true,
      message: successText,
      color: MessageColor.Success
    }
  }

  /**
   * 显示失败信息
   * @param dangerText 信息文本
   */
  showDangerMessage(dangerText: string) {
    // console.log('showDangerMessage')
    this.snackbar = {
      show: true,
      message: dangerText,
      color: MessageColor.Error
    }
  }
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
