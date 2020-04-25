const now = new Date()

module.exports = (serviceName) => {
  return [
    `1.0.0 / ${now.toLocaleDateString()}\n`,
    `==================\n`,
    `- Initial commmit: moved content over from \`${serviceName}\` package.\n`,
  ].join('\n')
}
