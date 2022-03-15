const catchy = require('catchy-image')
const path = require('path')
const fs = require('fs').promises

module.exports = async (
  { markdownNode, actions, reporter, createNodeId },
  { output = {}, meta = {}, ...option } = {},
) => {
  const { createNode, createParentChildLink, createNodeField } = actions

  const { frontmatter } = markdownNode
  if (!frontmatter || (!frontmatter.title && !frontmatter.autoHeroText)) {
    return
  }

  const publicDir = path.join(process.cwd(), 'public')
  const filePath = output.filePath?.(markdownNode) || path.join('hero', `${markdownNode.id}.png`)
  const absolutePath = path.join(publicDir, filePath)
  const { dir, base } = path.parse(absolutePath)
  const text = frontmatter.autoHeroText || frontmatter.title

  try {
    await fs.stat(dir)
  } catch (e) {
    await fs.mkdir(dir, { recursive: true })
  }

  const result = await catchy.generate({
    ...option,
    output: {
      ...output,
      directory: dir,
      fileName: base,
    },
    meta: {
      ...meta,
      title: text,
    },
  })

  const node = {
    id: createNodeId(`${markdownNode.id} >> AutoHero`),
    children: [],
    parent: markdownNode.id,
    internal: {
      contentDigest: `${markdownNode.internal.contentDigest}`,
      type: 'AutoHero',
    },
    text,
    path: filePath,
  }

  createNode(node)
  createParentChildLink({ parent: markdownNode, child: node })
  createNodeField({
    node: markdownNode,
    name: 'hero',
    value: {
      text,
      path: filePath,
    },
  })

  reporter.verbose(`[gatsby-remark-auto-hero] Generated: ${result}`)
}
