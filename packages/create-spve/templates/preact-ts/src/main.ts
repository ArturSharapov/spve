import { initializeSP, type SpveModule } from 'spve'
import { h, render } from 'preact'
import { App } from './App'
import './style.css'

const application: SpveModule = {
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
