// const path = require(`path`)
// const { createFilePath } = require(`gatsby-source-filesystem`)
// const { isPublished } = require('./src/utils')

import path from 'path'
import { createFilePath } from 'gatsby-source-filesystem'
import { isPublished } from './src/utils'
import type { GatsbyNode } from 'gatsby'

type MdxNode = {
  id: string
  fields: {
    slug: string
  }
  frontmatter: {
    title: string
    description: string
    date: string
    category: string
    isDraft: boolean | null
  }
}

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Define a template for blog post
  const blogPost = path.resolve(`./src/templates/blog-post/component.tsx`)

  // Get all markdown blog posts sorted by date
  const result = await graphql<{ allMdx: { nodes: MdxNode[] } }>(
    `
      {
        allMdx(
          filter: { frontmatter: { isDraft: { ne: true } } }
          sort: { fields: [frontmatter___date], order: ASC }
          limit: 1000
        ) {
          nodes {
            id
            fields {
              slug
            }
            frontmatter {
              title
              description
              date
              category
              isDraft
            }
          }
        }
      }
    `,
  )

  if (result.errors) {
    reporter.panicOnBuild(`There was an error loading your blog posts`, result.errors)
    return
  }

  const posts = result.data!.allMdx.nodes

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  posts.forEach((post, index) => {
    const previousPostId = index === 0 ? null : posts[index - 1]?.id
    const nextPostId = index === posts.length - 1 ? null : posts[index + 1]?.id

    createPage({
      path: post.fields.slug,
      component: blogPost,
      context: {
        id: post.id,
        previousPostId,
        nextPostId,
      },
    })
  })
}

export const onCreateNode: GatsbyNode['onCreateNode'] = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `Mdx`) {
    const value = createFilePath({ node, getNode, trailingSlash: false })

    createNodeField({
      name: `slug`,
      node,
      value: `/x${value}`,
    })
  }
}

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions }) => {
  const { createTypes } = actions

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }

    type Mdx implements Node {
      frontmatter: Frontmatter
      fields: Fields
      tableOfContents: JSON
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
      category: String
      tags: [String!]
      isDraft: Boolean
    }

    type Fields {
      slug: String
    }
  `)
}
