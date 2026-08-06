import { initializeSP, type SpveModule } from 'spve'
import { nothing, render } from 'lit'
import { App } from './App'
import './style.css'

const application: SpveModule = {
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
