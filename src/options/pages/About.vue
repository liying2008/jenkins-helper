<template>
  <div id="options-about-wrapper">
    <v-container>
      <v-card
        class="mx-auto mt-5"
        max-width="900"
      >
        <v-container>
          <v-card-title>{{ strings.about }}</v-card-title>
          <!--项目源代码-->
          <v-list
            subheader
            shaped
          >
            <v-subheader>{{ strings.sourceCode }}</v-subheader>
            <v-list-item
              v-for="(item, i) in sourceCodeItems"
              :key="i"
              link
              target="_blank"
              :href="item.link"
            >
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <!--联系作者-->
          <v-list
            subheader
            shaped
          >
            <v-subheader>{{ strings.contactAuthor }}</v-subheader>
            <v-list-item
              v-for="(item, i) in contactAuthorItems"
              :key="i"
              link
              :target="item.target"
              :href="item.link"
            >
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <!--反馈问题-->
          <v-list
            subheader
            shaped
          >
            <v-subheader>{{ strings.reportIssue }}</v-subheader>
            <v-list-item
              v-for="(item, i) in reportIssueItems"
              :key="i"
              link
              target="_blank"
              :href="item.link"
            >
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card>
      <div class="my-6" />
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class About extends Vue {
  strings = {
    about: browser.i18n.getMessage('about'),
    sourceCode: browser.i18n.getMessage('sourceCode'),
    contactAuthor: browser.i18n.getMessage('contactAuthor'),
    reportIssue: browser.i18n.getMessage('reportIssue'),
  }
  sourceCodeItems = [
    {
      icon: 'mdi-git',
      link: 'https://github.com/liying2008/jenkins-helper',
      text: 'https://github.com/liying2008/jenkins-helper'
    },
    {
      icon: 'mdi-scale-balance',
      link: 'https://github.com/liying2008/jenkins-helper/blob/master/LICENSE',
      text: 'MIT'
    },
  ]
  contactAuthorItems = [
    {
      icon: 'mdi-email',
      link: 'mailto:liruoer2008@yeah.net',
      text: 'liruoer2008@yeah.net',
      target: undefined
    },
    {
      icon: 'mdi-github',
      link: 'https://github.com/liying2008',
      text: 'https://github.com/liying2008',
      target: '_blank',
    },
  ]
  reportIssueItems = [
    {
      icon: 'mdi-bug',
      link: 'https://github.com/liying2008/jenkins-helper/issues',
      text: 'https://github.com/liying2008/jenkins-helper/issues'
    },
  ]
}
</script>

<style scoped lang="scss">
</style>
