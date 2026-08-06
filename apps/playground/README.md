# SPVE Playground

SPVE integration playground

```sh
vp install
vp dev
```

For SharePoint development, run:

```sh
vp dev -m sp
```

The SharePoint site URL and development ports live under `dev` in `spve.config.ts`.

Create the production application bundle with `vp build`, or the SharePoint package with
`vp build -m sp`.

SharePoint metadata, solution version, generated IDs, and development ports live in
`spve.config.ts`. Optional Microsoft Entra settings live in `.env.local`.
