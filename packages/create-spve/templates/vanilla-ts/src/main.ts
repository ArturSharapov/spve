import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { App } from './App'
import './style.css'

const application: SpveModule = {
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
