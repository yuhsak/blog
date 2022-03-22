const path = require('path')
const fs = require('fs').promises
const catchy = require('catchy-image')
const { createFileNodeFromBuffer } = require('gatsby-source-filesystem')

exports.createSchemaCustomization = (
  { actions, store, cache, createNodeId, schema },
  { types = ['MarkdownRemark', 'Mdx'], meta = {}, ...option } = {},
) => {
  const { createNode, createTypes } = actions

  const typeDefs = [
    schema.buildObjectType({
      name: `AutoHero`,
      fields: {
        text: {
          type: `String!`,
          resolve(source, args, ctx, info) {
            return source.text
          },
        },
        image: {
          type: `File!`,
          async resolve(source, args, ctx, info) {
            const cacheDir = path.join(process.cwd(), '.cache', 'caches')
            const dir = path.join(cacheDir, 'gatsby-plugin-auto-hero-tmp')

            try {
              await fs.stat(dir)
            } catch (e) {
              await fs.mkdir(dir, { recursive: true })
            }

            const cacheKey = `gatsby-plugin-auto-hero/${source.internal.contentDigest}`

            const cachedFilePath = await cache.get(cacheKey)

            const generatedFilePath =
              cachedFilePath ||
              (await catchy.generate({
                ...option,
                output: {
                  directory: dir,
                  fileName: `${source.id}.png`,
                },
                meta: {
                  ...meta,
                  title: source.text,
                },
              }))

            await cache.set(cacheKey, generatedFilePath)

            const buffer = await fs.readFile(generatedFilePath)

            const node = await createFileNodeFromBuffer({
              buffer,
              store,
              cache,
              createNode,
              createNodeId,
              parentNodeId: source.id,
              ext: '.png',
              name: 'hero',
            })

            return node
          },
        },
      },
      interfaces: [`Node`],
      extensions: {
        infer: false,
        childOf: types,
      },
    }),
  ]

  createTypes(typeDefs)
}
