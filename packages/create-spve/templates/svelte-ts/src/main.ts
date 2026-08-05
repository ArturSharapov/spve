import type { SPFI } from '@pnp/sp'
import type { SpveModule } from 'spve'
import { initializeSP } from 'spve/internal/runtime'
import { mount, unmount } from 'svelte'
import { writable } from 'svelte/store'
import App from './App.svelte'
import type { AppProps } from './types'
import './style.css'

interface Services {
  sp: SPFI
}

const application: SpveModule<AppProps, Services> = {
  mount({ element, props, services }) {
    initializeSP(services.sp)
    const properties = writable({ ...props })
    const component = mount(App, { target: element, props: { properties } })

    return {
      setProps: (next) => properties.set({ ...next }),
      unmount: () => void unmount(component),
    }
  },
}

export default application
