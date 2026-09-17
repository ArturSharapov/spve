import { expect, test } from 'vite-plus/test'
import { defineVanillaApp } from '../vanilla.mjs'
import { sp } from '../sp.mjs'

test('two mounts share the first client and retain independent props and disposal', () => {
  const client = { site: 'first' }
  const secondClient = { site: 'second' }
  const first = {
    replaceChildren(...children) {
      this.children = children
    },
  }
  const second = {
    replaceChildren(...children) {
      this.children = children
    },
  }
  const app = defineVanillaApp((props) => props.list)
  const a = app.mount({ element: first, props: { list: 'one' }, services: { sp: client } })
  const b = app.mount({ element: second, props: { list: 'two' }, services: { sp: secondClient } })
  expect(sp).toBe(client)
  a.setProps({ list: 'changed' })
  expect(first.children).toEqual(['changed'])
  expect(second.children).toEqual(['two'])
  a.unmount()
  b.setProps({ list: 'still mounted' })
  expect(first.children).toEqual([])
  expect(second.children).toEqual(['still mounted'])
  b.unmount()
})
