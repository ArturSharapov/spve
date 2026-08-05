import '@builder.io/qwik/qwikloader.js'
import type { SPFI } from '@pnp/sp'
import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { render } from '@builder.io/qwik'
import { App, type AppProps } from './App'
import './style.css'

interface Services {
  sp: SPFI
}

const application: SpveModule<AppProps, Services> = {
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

export default application
