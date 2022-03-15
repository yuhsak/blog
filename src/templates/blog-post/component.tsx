import * as React from 'react'
import { Link, graphql, PageProps } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { MDXProvider, MDXProviderComponents } from '@mdx-js/react'
import { NoteBox, InfoBox, WarnBox, ErrorBox } from '../../components/box'

const components: MDXProviderComponents = { NoteBox, InfoBox, WarnBox, ErrorBox }

import Layout from '../../components/layout'
import Seo from '../../components/seo'
import { TableOfContents, TableOfContentsItemData } from './table-of-contents'

type DataProps = {
  site: {
    siteMetadata: {
      title: string
      siteUrl: string
    }
  }
  mdx: {
    id: string
    excerpt: string
    body: string
    frontmatter: {
      title: string
      date: string
      description: string
      category: string
      tags: string[]
    }
    tableOfContents: {
      items: TableOfContentsItemData[]
    }
    fields: {
      slug: string
      hero: {
        text: string
        path: string
      }
    }
  }
  previous: {
    fields: {
      slug: string
    }
    frontmatter: {
      title: string
    }
  }
  next: {
    fields: {
      slug: string
    }
    frontmatter: {
      title: string
    }
  }
}

const BlogPostTemplate = ({
  data: {
    mdx: post,
    site: {
      siteMetadata: { title, siteUrl },
    },
    previous,
    next,
  },
  location,
}: PageProps<DataProps>) => {
  const toc = post.tableOfContents.items || []
  const url = `${siteUrl}${post.fields.slug}`
  const image = `${siteUrl}${post.fields.hero.path}`

  return (
    <Layout location={location} title={title}>
      <Seo
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
        url={url}
        image={image}
      />
      <article className='blog-post' itemScope itemType='http://schema.org/Article'>
        <header>
          <h1 itemProp='headline'>{post.frontmatter.title}</h1>
          <p>{post.frontmatter.date}</p>
        </header>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <section itemProp='articleBody' style={{ flex: 1, minWidth: '1em' }}>
            <MDXProvider components={components}>
              <MDXRenderer>{post.body}</MDXRenderer>
            </MDXProvider>
          </section>
          <TableOfContents
            className='table-of-contents'
            items={toc}
            tags={['h2', 'h3', 'h4']}
            url={location.pathname}
          />
        </div>
      </article>
      <hr />
      <nav className='blog-post-nav'>
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel='prev'>
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel='next'>
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($id: String!, $previousPostId: String, $nextPostId: String) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    mdx(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      body
      frontmatter {
        title
        date(formatString: "YYYY/MM/DD")
        description
        category
        tags
      }
      tableOfContents
      fields {
        slug
        hero {
          text
          path
        }
      }
    }
    previous: mdx(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: mdx(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
