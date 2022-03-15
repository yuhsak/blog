import * as React from 'react'
import { Link, graphql, PageProps } from 'gatsby'

import Bio from '../components/bio'
import Layout from '../components/layout'
import Seo from '../components/seo'

type DataProps = {
  site: {
    siteMetadata: {
      title: string
      siteUrl: string
    }
  }
  allMdx: {
    nodes: {
      excerpt: string
      fields: {
        slug: string
      }
      frontmatter: {
        title: string
        date: string
        description: string
      }
    }[]
  }
}

const BlogIndex = ({ data, location }: PageProps<DataProps>) => {
  const { title, siteUrl } = data.site.siteMetadata
  const posts = data.allMdx.nodes

  if (posts.length === 0) {
    return (
      <Layout location={location} title={title}>
        <Seo title={title} url={siteUrl} image={`${siteUrl}/ogp.png`} />
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the directory you specified
          for the "gatsby-source-filesystem" plugin in gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={title}>
      <Seo title={title} url={siteUrl} image={`${siteUrl}/ogp.png`} />
      <Bio />
      <ol style={{ listStyle: `none` }}>
        {posts.map((post) => {
          const title = post.frontmatter.title || post.fields.slug

          return (
            <li key={post.fields.slug}>
              <article className='post-list-item' itemScope itemType='http://schema.org/Article'>
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp='url'>
                      <span itemProp='headline'>{title}</span>
                    </Link>
                  </h2>
                  <small>{post.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                    itemProp='description'
                  />
                </section>
              </article>
            </li>
          )
        })}
      </ol>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    allMdx(sort: { fields: [frontmatter___date], order: DESC }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "YYYY/MM/DD")
          title
          description
        }
      }
    }
  }
`
