import React from 'react'
import { Helmet } from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'

export type SeoProps = {
  lang?: string
  title?: string
  description?: string
  url?: string
  image?: string | null | undefined
  meta?: any[]
}

type QueryData = {
  site: {
    siteMetadata: {
      title: string
      description: string
      siteUrl: string
      social: {
        twitter: string
      }
    }
  }
}

const Seo: React.FC<SeoProps> = ({ title, description, url, image, lang = 'ja', meta = [] }) => {
  const {
    site: { siteMetadata },
  } = useStaticQuery<QueryData>(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            siteUrl
            social {
              twitter
            }
          }
        }
      }
    `,
  )

  description = description || siteMetadata.description

  const siteTitle = siteMetadata.title
  const pageTitle = title === siteTitle ? siteTitle : `${title} | ${siteTitle}`

  const commons = [
    {
      name: `description`,
      content: description,
    },
  ]

  const ogps = [
    {
      property: `og:title`,
      content: pageTitle,
    },
    {
      property: `og:description`,
      content: description,
    },
    {
      property: `og:type`,
      content: `website`,
    },
    ...(url
      ? [
          {
            property: `og:url`,
            content: url,
          },
        ]
      : []),
    ...(image
      ? [
          {
            property: `og:image`,
            content: image,
          },
        ]
      : []),
  ]

  const twitters = [
    {
      name: `twitter:card`,
      content: `summary_large_image`,
    },
    {
      name: `twitter:creator`,
      content: siteMetadata.social.twitter,
    },
    {
      name: `twitter:title`,
      content: pageTitle,
    },
    {
      name: `twitter:description`,
      content: description,
    },
  ]

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={pageTitle}
      titleTemplate={`%s`}
      meta={[...commons, ...ogps, ...twitters, ...meta]}
      defer={false}
    >
      {url && <link rel='canonical' href={url} />}
    </Helmet>
  )
}

export default Seo
