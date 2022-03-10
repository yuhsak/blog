import * as React from 'react'
import { useEffect, useState } from 'react'
import { Link, graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'

import Layout from '../components/layout'
import Seo from '../components/seo'

type TableOfContentsItemData = {
  url: string
  title: string
  items?: TableOfContentsItemData[]
}

const TableOfContentsItem: React.FC<
  TableOfContentsItemData & {
    activeIndexId?: undefined | string
    onClick?: undefined | ((url: string) => void)
    depth?: number
  }
> = ({ url, title, items, activeIndexId, onClick, depth = 0 }) => {
  return (
    <li>
      <a
        href={url}
        className={activeIndexId === url ? 'active' : ''}
        onClick={() => {
          onClick?.(url)
        }}
      >
        {title}
      </a>
      {/* make cond value larger than 0 to render h3, h4 and so on. */}
      {items && depth < 0 && (
        <ul style={{ paddingLeft: `${(depth + 1) * 16}px` }}>
          {items.map((item) => (
            <TableOfContentsItem
              key={item.url}
              {...item}
              activeIndexId={activeIndexId}
              onClick={onClick}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

const BlogPostTemplate = ({ data, location }: any) => {
  const post = data.mdx
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const { previous, next } = data

  const [activeIndexId, _setActiveIndexId] = useState<string>()

  const setActiveIndexId = (delay?: number) => (idOrHash: string) => {
    idOrHash = idOrHash.startsWith('#') ? idOrHash : `#${idOrHash}`
    const handle = () => {
      _setActiveIndexId(idOrHash)
      history.pushState(null, '', idOrHash)
    }
    const exec = delay ? () => setTimeout(handle, delay) : handle
    exec()
  }

  useEffect(() => {
    const headings = document.querySelectorAll('h2')
    const handle = setActiveIndexId()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handle(entry.target.id)
          }
        })
      },
      {
        root: null,
        rootMargin: '-20% 0px',
        threshold: 0, // 閾値は0
      },
    )

    headings.forEach(observer.observe.bind(observer))

    return () => {
      observer.disconnect()
    }
  }, [location.pathname])

  return (
    <Layout location={location} title={siteTitle}>
      <Seo
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
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
            <MDXRenderer>{post.body}</MDXRenderer>
          </section>
          <ul
            className='table-of-contents'
            style={{
              width: '192px',
              position: 'sticky',
              top: 0,
              marginLeft: 'var(--spacing-12)',
              overflowY: 'scroll',
            }}
          >
            {post.tableOfContents.items.map((item: any) => (
              <TableOfContentsItem
                key={item.url}
                {...item}
                activeIndexId={activeIndexId}
                onClick={setActiveIndexId(100)}
              />
            ))}
          </ul>
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
      }
      tableOfContents
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
