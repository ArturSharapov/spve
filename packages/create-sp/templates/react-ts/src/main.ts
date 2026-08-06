import { initializeSP, type SpveApp } from 'spve'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './style.css'

const app: SpveApp = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    const root = createRoot(element)

    root.render(createElement(App, props))

    return {
      setProps: (next) => root.render(createElement(App, next)),
      unmount: () => root.unmount(),
    }
  },
}

export default app
