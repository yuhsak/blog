const catchy = require('catchy-image')
const path = require('path')

module.exports = async ({ markdownNode }, pluginOptions) => {
  const result = await catchy.generate({
    ...pluginOptions,
    output: {
      ...pluginOptions.output,
      directory: path.join(
        './public',
        pluginOptions.output.directory || '',
        markdownNode.fields.slug,
      ),
      fileName: pluginOptions.output.fileName,
    },
    meta: {
      ...pluginOptions.meta,
      title: markdownNode.frontmatter.title,
    },
  })

  console.info(`gatsby-remark-og-image: Successful generated: ${result}`)
}
