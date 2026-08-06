import { initializeSP, type SpveApp } from 'spve'
import { createApp, h, reactive } from 'vue'
import App from './App.vue'
import './style.css'

const app: SpveApp = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    const state = reactive({ ...props })
    const vue = createApp({ render: () => h(App, state) })
    vue.mount(element)

    return {
      setProps(next) {
        for (const key of Object.keys(state) as (keyof typeof state)[]) {
          if (!(key in next)) delete state[key]
        }
        Object.assign(state, next)
      },
      unmount: () => vue.unmount(),
    }
  },
}

export default app
