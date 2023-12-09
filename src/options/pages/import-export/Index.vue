<script lang="ts" setup>
import { ref } from 'vue'
import { CloudDownloadOutline, CloudUploadOutline } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import type { SettingsFileData } from '~/models/settings-file'
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

const message = useMessage()

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
    // console.log('exportSettings', result)
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
  StorageService.set(settings.data as Record<string, any>).then(() => {
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
  message.success(successText)
}

/**
 * 显示失败信息
 * @param dangerText 信息文本
 */
function showDangerMessage(dangerText: string) {
  // console.log('showDangerMessage')
  message.error(dangerText)
}
</script>

<template>
  <div class="options-import-export-wrapper">
    <div class="cards">
      <n-grid
        x-gap="12"
        :cols="2"
      >
        <!-- 导入设置 -->
        <n-gi>
          <n-card
            hoverable
            embedded
            class="pointer-cursor"
            :disabled="disableImportBtn"
            :title="strings.importSettings"
            @click="importSettings"
          >
            <n-icon
              size="86"
              class="icon-center"
            >
              <CloudUploadOutline />
            </n-icon>
          </n-card>
        </n-gi>
        <!-- 导出设置 -->
        <n-gi>
          <n-card
            hoverable
            embedded
            class="pointer-cursor"
            :disabled="disableExportBtn"
            :title="strings.exportSettings"
            @click="exportSettings"
          >
            <n-icon
              size="86"
              class="icon-center"
            >
              <CloudDownloadOutline />
            </n-icon>
          </n-card>
        </n-gi>
      </n-grid>
      <n-grid :cols="1">
        <n-gi>
          <n-el class="tip-text">
            {{ strings.exportSettingsTip }}
          </n-el>
        </n-gi>
      </n-grid>
    </div>
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
.options-import-export-wrapper {
  padding: 24px;

  .cards {
    max-width: 600px;
    margin: auto;

    .pointer-cursor {
      cursor: pointer;

      .icon-center {
        width: 100%;
        height: 100%;
        text-align: center;
      }
    }

    .tip-text {
      margin-top: 20px;
      color: #888888;
    }
  }
}
</style>
