<template>
    <v-app>
       <!-- <v-navigation-drawer
                fixed
                :mini-variant="miniVariant"
                :clipped="clipped"
                v-model="drawer"
                app
        >
            <v-list>
                <v-list-tile
                        value="true"
                        v-for="(item, i) in items"
                        :key="i"
                        @click="navigate(i)"
                >
                    <v-list-tile-action>
                        <v-icon v-html="item.icon" :color="item.active ? 'teal' : 'grey'"></v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title v-text="item.title"
                                           ></v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>-->
        <v-toolbar fixed app :clipped-left="clipped">
            <!--<v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <!--<v-btn icon @click.stop="miniVariant = !miniVariant">
                <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
            </v-btn>
            <v-btn icon @click.stop="clipped = !clipped">
                <v-icon>web</v-icon>
            </v-btn>
            <v-btn icon @click.stop="fixed = !fixed">
                <v-icon>remove</v-icon>
            </v-btn>-->
            <v-toolbar-title v-text="title"></v-toolbar-title>
            <v-spacer></v-spacer>

        </v-toolbar>
        <v-content>
            <v-container fluid>
                <v-slide-y-transition mode="out-in">

                    <router-view></router-view>

                </v-slide-y-transition>
            </v-container>
        </v-content>

        <v-footer :fixed="fixed" app>
            <span>&copy; 2017 Tim Eipert</span>
        </v-footer>
    </v-app>
</template>

<script>
      export default {
            data () {
                  return {
                        clipped: false,
                        drawer: false,
                        fixed: false,
                        items: [
                              {icon: 'show_chart', title: 'Mono', 'link': 'mono', active: true},
                              {icon: 'show_chart', title: 'Poly', 'link': 'poly', active: false},
                              {icon: 'help', title: 'Help', 'link': 'help', active: false}
                        ],
                        miniVariant: false,

                        title: 'Sequence Alignment'
                  }
            },
            methods: {
                  navigate: function (i) {
                        this.$router.push(this.items[i].link)
                        this.items = this.items.map(e => {
                              e.active = false
                              return e
                        })
                        this.items[i].active = true
                  }
            }
      }
</script>
