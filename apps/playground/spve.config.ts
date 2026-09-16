import type { SpveConfig } from 'spve'

export default {
  name: 'spve-playground',
  title: 'SPVE Playground',
  description: 'SPVE integration playground',
  version: '0.0.1',
  ids: {
    component: '7b6434a6-ec9b-4e2c-823e-72e906064c3c',
    solution: '6df5dd25-7eb6-48b2-b863-c4924db70acc',
    feature: 'd11d1952-4251-4228-a846-a89e261437c7',
  },
  dev: {
    siteUrl: 'https://ofekpoint.sharepoint.com/sites/hrsp',
    vitePort: 17641,
    spfxPort: 17642,
  },
  webpart: {
    alias: 'SpvePlaygroundWebPart',
    icon: 'Page',
    group: 'Advanced',
    supportedHosts: ['SharePointWebPart'],
    properties: {
      description: {
        type: 'string',
        label: 'Description',
        required: true,
        default: 'ad',
        control: {
          type: 'dropdown',
          options: [
            { value: 'ad', label: 'AD' },
            { value: 'ad2', label: 'AD2' },
            { value: 'ad3', label: 'AD3' },
          ],
        },
      },
      numfield: {
        type: 'number',
        label: 'Options Count',
        default: 0,
      },
    },
  },
  solution: {
    skipFeatureDeployment: true,
    permissions: [],
  },
} satisfies SpveConfig
