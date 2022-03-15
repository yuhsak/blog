const catchy = require('catchy-image')
const path = require('path')

module.exports = async (args, option) => {
  // console.log(args)
  const { markdownNode, reporter } = args
  const result = await catchy.generate({
    ...option,
    output: {
      ...option.output,
      directory: path.join('./public', option.output.directory || '', markdownNode.fields.slug),
      fileName: option.output.fileName,
    },
    meta: {
      ...option.meta,
      title: markdownNode.frontmatter.title,
    },
  })

  reporter.verbose(`[gatsby-remark-og-image] Generated: ${result}`)
}
