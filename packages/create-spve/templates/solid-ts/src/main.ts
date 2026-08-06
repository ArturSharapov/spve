import type { SpveModule } from 'spve'
import type { AppProps } from 'spve/client'
import { initializeSP } from 'spve/internal/runtime'
import { createComponent } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { render } from 'solid-js/web'
import { App } from './App'
import './style.css'

const application: SpveModule = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    const [state, setState] = createStore<AppProps>({ ...props })
    const dispose = render(() => createComponent(App, state), element)

    return {
      setProps: (next) => setState(reconcile({ ...next })),
      unmount: dispose,
    }
  },
}

export default application
