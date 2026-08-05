import type { SPFI } from '@pnp/sp'
import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { h, render } from 'preact'
import { App, type AppProps } from './App'
import './style.css'

interface Services {
  sp: SPFI
}

const application: SpveModule<AppProps, Services> = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    let currentProps = { ...props }

    const update = () => render(h(App, currentProps), element)
    update()

    return {
      setProps(next) {
        currentProps = { ...next }
        update()
      },
      unmount: () => render(null, element),
    }
  },
}

export default application
