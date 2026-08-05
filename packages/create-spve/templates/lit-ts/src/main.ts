import type { SPFI } from '@pnp/sp'
import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { nothing, render } from 'lit'
import { App, type AppProps } from './App'
import './style.css'

interface Services {
  sp: SPFI
}

const application: SpveModule<AppProps, Services> = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    let currentProps = { ...props }

    const update = () => render(App(currentProps), element)
    update()

    return {
      setProps(next) {
        currentProps = { ...next }
        update()
      },
      unmount: () => render(nothing, element),
    }
  },
}

export default application
