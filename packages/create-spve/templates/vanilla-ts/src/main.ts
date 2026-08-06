import { initializeSP, type SpveApp } from 'spve'
import { App } from './App'
import './style.css'

const app: SpveApp = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    element.replaceChildren(App(props))

    return {
      setProps: (next) => element.replaceChildren(App(next)),
      unmount: () => element.replaceChildren(),
    }
  },
}

export default app
