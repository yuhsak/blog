const path = require('path')

module.exports = {
  siteMetadata: {
    title: `Notes for hacks`,
    author: {
      name: `井上祐作`,
      summary: `東京都在住のソフトウェアエンジニア。Web系とかデータ分析とか諸々`,
    },
    description: `ソフトウェアエンジニアの技術メモ`,
    siteUrl: `https://blog.ysk.im`,
    social: {
      twitter: `YuhsakInoue`,
    },
  },
  plugins: [
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/articles`,
        name: `articles`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/images`,
        name: `images`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        gatsbyRemarkPlugins: [
          'gatsby-remark-prismjs-title',
          `gatsby-remark-autolink-headers`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
              withWebp: true,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              prompt: {
                user: 'root',
                host: 'localhost',
                global: false,
              },
              languageExtensions: [
                {
                  extend: 'shell',
                  insertBefore: {
                    function: {
                      'extra-function': {
                        pattern:
                          /(^|\n|sudo|[;|&]|[<>]\()\s*(?:brew|pip|npm|node|python|apt-key|ffmpeg|fallocate|!echo|!curl|!apt-get|!mkdir|!gcsfuse)(?=$|[)\s;|&])/,
                        lookbehind: true,
                      },
                    },
                  },
                },
              ],
            },
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          },
        ],
        remarkPlugins: [require('remark-math')],
        rehypePlugins: [[require('rehype-katex'), { strict: 'ignore' }]],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.nodes.map((node) => {
                return Object.assign({}, node.frontmatter, {
                  description: node.excerpt,
                  date: node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                  custom_elements: [{ 'content:encoded': node.html }],
                })
              })
            },
            query: `
              {
                allMdx(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  nodes {
                    excerpt
                    html
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                      date
                    }
                  }
                }
              }
            `,
            output: '/rss.xml',
            title: ' RSS Feed by Notes for hacks',
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-auto-hero`,
      options: {
        image: {
          width: 1200,
          height: 630,
          backgroundImage: require.resolve('./ogp/bg.png'),
        },
        style: {
          title: {
            fontFamily: 'Noto Sans CJK JP',
            fontColor: '#2e353f',
            fontWeight: 'bold',
            fontSize: 64,
            paddingTop: 100,
            paddingBottom: 200,
            paddingLeft: 150,
            paddingRight: 150,
          },
          author: {
            fontFamily: 'Noto Sans CJK JP',
            fontColor: '#2e353f',
            fontWeight: '400',
            fontSize: 42,
          },
        },
        meta: {
          author: '',
        },
        fontFile: [
          {
            path: require.resolve('./ogp/font/NotoSansCJKjp-Bold.otf'),
            family: 'Noto Sans CJK JP',
            weight: 'bold',
          },
          {
            path: require.resolve('./ogp/font/NotoSansCJKjp-Regular.otf'),
            family: 'Noto Sans CJK JP',
            weight: '400',
          },
        ],
        iconFile: require.resolve('./src/images/icon.png'),
        timeout: 10000,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Notes for hacks`,
        short_name: `NotesForHacks`,
        start_url: `/`,
        background_color: `#ffffff`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-react-helmet`,
    // `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: ['G-3ENRB065B2'],
        // gtagConfig: {
        //   optimize_id: "OPT_CONTAINER_ID",
        //   anonymize_ip: true,
        //   cookie_expires: 0,
        // },
        pluginConfig: {
          head: false,
          respectDNT: true,
          // exclude: ["/preview/**", "/do-not-track/me/too/"],
          // origin: "YOUR_SELF_HOSTED_ORIGIN",
        },
      },
    },
    'gatsby-plugin-sitemap',
    // `gatsby-transformer-auto-ogp-image`,
  ],
}
