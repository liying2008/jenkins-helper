<template>
  <v-app>
    <Header></Header>
    <nav>
      <Sidebar></Sidebar>
    </nav>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'

@Component({
  name: 'Layout',
  components: {
    Header,
    Sidebar,
  }
})
export default class Layout extends Vue {
  mounted() {
    console.log('lifecycle: ', 'Layout mounted!')
  }

}
</script>
