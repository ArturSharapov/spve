import type { SPFI } from '@pnp/sp'
import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { createComponent } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { render } from 'solid-js/web'
import { App, type AppProps } from './App'
import './style.css'

interface Services {
  sp: SPFI
}

const application: SpveModule<AppProps, Services> = {
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
