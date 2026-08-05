import type { SPFI } from '@pnp/sp'
import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { App, type AppProps } from './App'
import './style.css'

interface Services {
  sp: SPFI
}

const application: SpveModule<AppProps, Services> = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    let currentProps = { ...props }

    const render = () => element.replaceChildren(App(currentProps))
    render()

    return {
      setProps(next) {
        currentProps = { ...next }
        render()
      },
      unmount: () => element.replaceChildren(),
    }
  },
}

export default application
