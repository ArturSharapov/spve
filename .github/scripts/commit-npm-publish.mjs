import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'

const releases = JSON.parse(process.env.RELEASES)
const files = JSON.parse(process.env.FILES)
const source = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const remote = execFileSync('git', ['ls-remote', 'origin', 'refs/heads/main'], {
  encoding: 'utf8',
}).split('\t')[0]
assert.equal(remote, source, 'main changed while this checkout was being verified')
let commit = source
if (files.length) {
  const input = {
    branch: { repositoryNameWithOwner: process.env.GITHUB_REPOSITORY, branchName: 'main' },
    expectedHeadOid: source,
    message: {
      headline: `chore: publish ${releases.map(({ name, version }) => `${name}@${version}`).join(', ')}`,
    },
    fileChanges: {
      additions: files.map((file) => ({
        path: file,
        contents: readFileSync(file).toString('base64'),
      })),
    },
  }
  const result = JSON.parse(
    execFileSync('gh', ['api', 'graphql', '--input', '-'], {
      input: JSON.stringify({
        query:
          'mutation($input: CreateCommitOnBranchInput!) { createCommitOnBranch(input: $input) { commit { oid } } }',
        variables: { input },
      }),
      encoding: 'utf8',
    }),
  )
  assert.ok(!result.errors, JSON.stringify(result.errors))
  commit = result.data.createCommitOnBranch.commit.oid
}
assert.match(commit, /^[a-f0-9]{40}$/)
appendFileSync(process.env.GITHUB_OUTPUT, `sha=${commit}\n`)
appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\nVersion commit: ${commit}\n`)
