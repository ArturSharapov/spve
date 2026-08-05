# **TITLE**

**DESCRIPTION**

```sh
vp install
vp dev
```

For SharePoint development, copy `.env.example` to `.env.local`, configure the Azure application
and SharePoint site, then run:

```sh
vp dev -m sp
```

Create the production application bundle with `vp build`, or the SharePoint package with
`vp build -m sp`.

SharePoint metadata, solution version, generated IDs, and development ports live in
`spve.config.json`. Local SharePoint and Microsoft Entra settings live in `.env.local`.
