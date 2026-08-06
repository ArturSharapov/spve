import { initializeSP, type SpveApp } from 'spve'
import { h, render } from 'preact'
import { App } from './App'
import './style.css'

const app: SpveApp = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    render(h(App, props), element)

    return {
      setProps: (next) => render(h(App, next), element),
      unmount: () => render(null, element),
    }
  },
}

export default app
