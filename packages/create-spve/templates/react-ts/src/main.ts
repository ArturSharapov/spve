import type { SPFI } from '@pnp/sp'
import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { App, type AppProps } from './App'
import './style.css'

interface Services {
  sp: SPFI
}

const application: SpveModule<AppProps, Services> = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    const root = createRoot(element)
    let currentProps = { ...props }

    const render = () => root.render(createElement(App, currentProps))
    render()

    return {
      setProps(next) {
        currentProps = { ...next }
        render()
      },
      unmount: () => root.unmount(),
    }
  },
}

export default application
