import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import 'vuetify/dist/vuetify.css'

import Mono from './components/mono'
import Poly from './components/poly'
import About from './components/about'
import Help from './components/help'


Vue.use(Vuetify)
Vue.use(VueRouter)

const routes = [
      {path: '/', component: Mono},
      {path: '/mono', component: Mono},
      {path: '/poly', component: Poly},
      {path: '/about', component: About},
      {path: '/help', component: Help}
]

const router = new VueRouter({
      routes
})

new Vue({
      el: '#app',
      router,
      render: h => h(App)
})
