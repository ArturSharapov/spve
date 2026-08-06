import { initializeSP, type SpveApp } from 'spve'
import { nothing, render } from 'lit'
import { App } from './App'
import './style.css'

const app: SpveApp = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    render(App(props), element)

    return {
      setProps: (next) => render(App(next), element),
      unmount: () => render(nothing, element),
    }
  },
}

export default app
