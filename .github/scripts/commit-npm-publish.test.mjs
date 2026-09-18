import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

const script = new URL('./commit-npm-publish.mjs', import.meta.url)
let root
let repository
let eventSha
let sourceSha

function commitAndPush(version) {
  writeFileSync(path.join(repository, 'package.json'), JSON.stringify({ version }))
  execFileSync('git', ['add', 'package.json'], { cwd: repository })
  execFileSync(
    'git',
    [
      '-c',
      'commit.gpgsign=false',
      '-c',
      'user.name=Test',
      '-c',
      'user.email=test@example.com',
      'commit',
      '-qm',
      `Version ${version}`,
    ],
    { cwd: repository },
  )
  execFileSync('git', ['push', '-q', 'origin', 'HEAD:main'], { cwd: repository })
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim()
}

function runCommit(files) {
  return spawnSync(process.execPath, [script.pathname], {
    cwd: repository,
    encoding: 'utf8',
    env: {
      ...process.env,
      GITHUB_SHA: eventSha,
      GITHUB_REPOSITORY: 'owner/repo',
      RELEASES: JSON.stringify([{ name: '@spve/core', version: '0.0.8' }]),
      FILES: JSON.stringify(files),
      GITHUB_OUTPUT: path.join(root, 'output'),
      GITHUB_STEP_SUMMARY: path.join(root, 'summary'),
      PATH: `${path.join(root, 'bin')}${path.delimiter}${process.env.PATH}`,
    },
  })
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'spve-commit-'))
  repository = path.join(root, 'checkout')
  mkdirSync(repository)
  mkdirSync(path.join(root, 'bin'))
  execFileSync('git', ['init', '--bare', '-q', path.join(root, 'remote')])
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: repository })
  execFileSync('git', ['remote', 'add', 'origin', path.join(root, 'remote')], { cwd: repository })
  eventSha = commitAndPush('0.0.7')
  sourceSha = commitAndPush('0.0.8')
  writeFileSync(path.join(root, 'bin/gh'), `#!${process.execPath}\nprocess.exit(99)\n`, {
    mode: 0o755,
  })
})

afterEach(() => rmSync(root, { recursive: true, force: true }))

test('a retry reuses its existing bump commit despite an older event SHA', () => {
  const result = runCommit([])
  expect(result.status, result.stderr).toBe(0)
  expect(readFileSync(path.join(root, 'output'), 'utf8')).toBe(`sha=${sourceSha}\n`)
  expect(
    execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(),
  ).toBe(sourceSha)
})

test('new commits use the verified checkout SHA and include every planned file', () => {
  writeFileSync(path.join(repository, 'package.json'), '{"version":"0.0.9"}\n')
  writeFileSync(path.join(repository, 'pnpm-lock.yaml'), 'updated lockfile\n')
  const requestPath = path.join(root, 'request.json')
  const commit = 'a'.repeat(40)
  writeFileSync(
    path.join(root, 'bin/gh'),
    `#!${process.execPath}\nconst fs = require('node:fs')\nfs.writeFileSync(${JSON.stringify(requestPath)}, fs.readFileSync(0))\nconsole.log(JSON.stringify({ data: { createCommitOnBranch: { commit: { oid: '${commit}' } } } }))\n`,
    { mode: 0o755 },
  )
  const result = runCommit(['package.json', 'pnpm-lock.yaml'])
  expect(result.status, result.stderr).toBe(0)
  const request = JSON.parse(readFileSync(requestPath, 'utf8')).variables.input
  expect(request.expectedHeadOid).toBe(sourceSha)
  expect(request.branch).toEqual({ repositoryNameWithOwner: 'owner/repo', branchName: 'main' })
  expect(
    request.fileChanges.additions.map(({ path: file, contents }) => [
      file,
      Buffer.from(contents, 'base64').toString(),
    ]),
  ).toEqual([
    ['package.json', '{"version":"0.0.9"}\n'],
    ['pnpm-lock.yaml', 'updated lockfile\n'],
  ])
  expect(readFileSync(path.join(root, 'output'), 'utf8')).toBe(`sha=${commit}\n`)
})

test('a genuine concurrent change to main is never overwritten', () => {
  const advanced = commitAndPush('0.0.9')
  execFileSync('git', ['checkout', '-q', '--detach', sourceSha], { cwd: repository })
  const result = runCommit([])
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('main changed while this checkout was being verified')
  expect(
    execFileSync('git', ['ls-remote', 'origin', 'refs/heads/main'], {
      cwd: repository,
      encoding: 'utf8',
    }).split('\t')[0],
  ).toBe(advanced)
})
