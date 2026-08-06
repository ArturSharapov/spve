import { initializeSP, type SpveModule } from 'spve'
import { mount, unmount } from 'svelte'
import { writable } from 'svelte/store'
import App from './App.svelte'
import './style.css'

const application: SpveModule = {
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
