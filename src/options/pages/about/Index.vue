<script lang="ts" setup>
import { AtOutline, BugOutline, GitBranchOutline, KeyOutline, LogoGithub } from '@vicons/ionicons5'
import { t } from '~/libs/extension'

const strings = {
  about: t('about'),
  sourceCode: t('sourceCode'),
  contactAuthor: t('contactAuthor'),
  reportIssue: t('reportIssue'),
}

const aboutItems = [
  [
    {
      icon: GitBranchOutline,
      link: 'https://github.com/liying2008/jenkins-helper',
      text: 'https://github.com/liying2008/jenkins-helper',
    },
    {
      icon: KeyOutline,
      link: 'https://github.com/liying2008/jenkins-helper/blob/master/LICENSE',
      text: 'MIT',
    },
  ],
  [
    {
      icon: AtOutline,
      link: 'mailto:liruoer2008@yeah.net',
      text: 'liruoer2008@yeah.net',
      target: undefined,
    },
    {
      icon: LogoGithub,
      link: 'https://github.com/liying2008',
      text: 'https://github.com/liying2008',
      target: '_blank',
    },
  ], [
    {
      icon: BugOutline,
      link: 'https://github.com/liying2008/jenkins-helper/issues',
      text: 'https://github.com/liying2008/jenkins-helper/issues',
    },
  ],
]

const aboutTitles = [
  strings.sourceCode,
  strings.contactAuthor,
  strings.reportIssue,
]
</script>

<template>
  <n-el class="options-about-wrapper">
    <n-card
      v-for="(categoryItems, i) in aboutItems"
      :key="i"
      :title="aboutTitles[i]"
      embedded
      class="card"
    >
      <n-a
        v-for="(item, j) in categoryItems"
        :key="j"
        class="item"
        target="_blank"
        :href="item.link"
      >
        <n-icon
          class="item-icon"
          :component="item.icon"
          size="22"
        />
        <span class="item-text">{{ item.text }}</span>
      </n-a>
    </n-card>
  </n-el>
</template>

<style lang="scss">
.options-about-wrapper {
  padding: 24px;

  .card {
    max-width: 800px;
    margin: auto;
    margin-bottom: 10px;

    .item {
      display: flex;
      align-items: center;
      padding: 10px;

      &:hover {
        background-color: var(--hover-color);
        border-radius: 6px;
      }

      .item-icon {
        margin-right: 20px;
        vertical-align: middle;
      }

      .item-text {
        font-size: 16px;
        font-weight: lighter;
      }
    }
  }
}
</style>
