import type { SPFI } from '@pnp/sp'
import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { createApp, h, reactive } from 'vue'
import App from './App.vue'
import './style.css'

interface AppProps extends Record<string, unknown> {
  description?: string
}

interface Services {
  sp: SPFI
}

const application: SpveModule<AppProps, Services> = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    const state = reactive({ ...props })
    const vue = createApp({ render: () => h(App, state) })
    vue.mount(element)

    return {
      setProps(next) {
        for (const key of Object.keys(state)) {
          if (!(key in next)) delete state[key]
        }
        Object.assign(state, next)
      },
      unmount: () => vue.unmount(),
    }
  },
}

export default application
