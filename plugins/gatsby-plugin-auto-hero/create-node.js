exports.onCreateNode = async (
  { node, actions, createNodeId },
  { types = ['MarkdownRemark', 'Mdx'] } = {},
) => {
  if (!types.some((t) => t === node.internal.type)) {
    return
  }

  const { frontmatter } = node
  if (!frontmatter) {
    return
  }

  const text = frontmatter.title || frontmatter.autoHeroText
  if (!text) {
    return
  }

  const { createNode, createParentChildLink } = actions

  const heroNode = {
    id: createNodeId(`${node.id} >> AutoHero`),
    parent: node.id,
    internal: {
      contentDigest: `${node.internal.contentDigest} >> AutoHero`,
      type: 'AutoHero',
    },
    text,
  }

  createNode(heroNode)
  createParentChildLink({ parent: node, child: heroNode })
}
