// docker/metadata-action publishes {{version}} without a leading v. Preserve
// those release tags (including prereleases), as well as the moving aliases.
const releaseTag = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/

module.exports = function shouldDelete(version) {
  return !version.metadata.container.tags.some(
    tag =>
      tag.startsWith('v') ||
      tag === 'master' ||
      tag === 'latest' ||
      releaseTag.test(tag)
  )
}
