import '@builder.io/qwik/qwikloader.js'
import { initializeSP, type SpveApp } from 'spve'
import { render } from '@builder.io/qwik'
import { App } from './App'
import './style.css'

const app: SpveApp = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    const eventName = `spve:${crypto.randomUUID()}`
    const rendered = render(element, <App eventName={eventName} initialProps={{ ...props }} />)

    return {
      setProps(next) {
        void rendered.then(() => {
          window.dispatchEvent(new CustomEvent(eventName, { detail: { ...next } }))
        })
      },
      unmount() {
        void rendered.then((result) => result.cleanup())
      },
    }
  },
}

export default app
