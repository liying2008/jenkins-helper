<script lang="ts" setup>
import { ref } from 'vue'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import type { SettingsFileData } from '~/models/settings-file'
import { SnackbarData } from '~/models/message'
import { initTheme } from '~/theme'
import { t } from '~/libs/extension'

const strings = {
  close: t('close'),
  exportSettingsTip: t('exportSettingsTip'),
  importSettings: t('importSettings'),
  exportSettings: t('exportSettings'),
  settingsImported: t('settingsImported'),
  settingContentIsEmpty: t('settingContentIsEmpty'),
  settingsFileParsingFailed: t('settingsFileParsingFailed'),
  settingsFileContentIncorrect: t('settingsFileContentIncorrect'),
}

const settingsKeyName = 'jenkins-helper'
const disableExportBtn = ref(false)
const disableImportBtn = ref(false)
const configFile = ref<HTMLInputElement>()
const snackbar = ref(SnackbarData.empty())


/**
   * 导入设置
   */
function importSettings() {
  triggerUpload()
}

/**
   * 导出设置
   */
function exportSettings() {
  disableExportBtn.value = true
  StorageService.get([StorageService.keyForJenkinsUrl, StorageService.keyForNodes, StorageService.keyForOptions]).then((result) => {
    browser.management.getSelf().then((extensionInfo) => {
      // console.log('extensionInfo', extensionInfo)
      const fileContent = {
        name: settingsKeyName,
        version: extensionInfo!.version,
        data: result,
      }
      // console.log('fileContent', fileContent)
      const filename = `jenkins-helper_settings_${Tools.getReadableTime(Date.now(), false)}.json`
      // 开始下载
      triggerDownload(filename, JSON.stringify(fileContent))
      disableExportBtn.value = false
    })
  })
}

/**
   * 触发下载文件
   * @param filename 文件名
   * @param content 文件内容
   */
function triggerDownload(filename: string, content: string) {
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
function triggerUpload() {
  const inputElement = configFile.value!
  inputElement.value = ''
  inputElement.click()
}

/**
   * 读取文件内容
   * @param event
   */
function readFile(event: Event) {
  // console.log('event', event)
  const inputElement = configFile.value!
  const filePath = inputElement.value
  console.log('filePath', filePath)
  if (filePath) {
    const reader = new FileReader()
    reader.readAsText(inputElement.files![0], 'utf-8')

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
      startImport(reader.result as string)
    }
  }
}

/**
   * 开始导入
   * @param content settings文件内容
   */
function startImport(content: string) {
  let settings: SettingsFileData
  try {
    settings = JSON.parse(content)
  } catch (e) {
    console.log(e)
    showDangerMessage(strings.settingsFileParsingFailed)
    return
  }
  // console.log('settings', settings)
  if (settings.name !== settingsKeyName) {
    showDangerMessage(strings.settingsFileContentIncorrect)
    return
  }
  if (!settings.data || Object.getOwnPropertyNames(settings.data).length === 0) {
    showDangerMessage(strings.settingContentIsEmpty)
    return
  }
  StorageService.set(settings.data).then(() => {
    showSuccessMessage(strings.settingsImported)
    // 应用新主题设置
    initTheme()
  })
}

/**
   * 显示成功信息
   * @param successText 信息文本
   */
function showSuccessMessage(successText: string) {
  // console.log('showSuccessMessage')
  snackbar.value = SnackbarData.builder()
    .message(successText)
    .color('success')
    .build()
}

/**
   * 显示失败信息
   * @param dangerText 信息文本
   */
function showDangerMessage(dangerText: string) {
  // console.log('showDangerMessage')
  snackbar.value = SnackbarData.builder()
    .message(dangerText)
    .color('error')
    .build()
}
</script>

<template>
  <div id="options-import-export-wrapper">
    <v-container>
      <div
        class="mx-auto mt-2"
        style="max-width: 900px;"
      >
        <v-row>
          <v-col cols="6">
            <v-hover v-slot="{ hover }">
              <v-card
                ripple
                height="200"
                :elevation="hover ? 6 : 2"
                class="pointer-cursor"
                :class="[{ 'on-hover': hover }]"
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
            <v-hover v-slot="{ hover }">
              <v-card
                ripple
                height="200"
                :elevation="hover ? 6 : 2"
                class="pointer-cursor"
                :class="[{ 'on-hover': hover }]"
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
      <j-snackbar :snackbar-data="snackbar" />
    </v-container>
    <!-- 隐藏的文件上传输入框 -->
    <input
      id="configFile"
      ref="configFile"
      type="file"
      name="configFile"
      value=""
      accept="application/json"
      style="display: none;"
      @change="readFile($event)"
    />
  </div>
</template>

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
