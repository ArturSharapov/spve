import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './style.css'

const application: SpveModule = {
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
