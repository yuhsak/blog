const visit = require('unist-util-visit')

const extractBraceQueryStrings = (text) => {
  return [...text].reduce(
    (acc, char) => {
      if (char === '{') {
        acc.depth += 1
      }
      if (acc.depth > 0) {
        acc.stack += char
      }
      if (char === '}') {
        acc.depth = Math.max(0, acc.depth - 1)
        if (acc.depth === 0 && acc.stack) {
          acc.queries = [...acc.queries, acc.stack]
          acc.stack = ''
        }
      }
      return acc
    },
    { queries: [], stack: '', depth: 0 },
  ).queries
}

module.exports = ({ markdownAST }, { className = [] } = {}) => {
  visit(markdownAST, 'code', (node, index) => {
    const nodeLang = node.lang ? (node.meta ? `${node.lang} ${node.meta}` : node.lang) : ''
    const braceQueryStrings = extractBraceQueryStrings(nodeLang)
    const langWithoutBraceQueryString = braceQueryStrings.reduce(
      (lang, query) => lang.replace(query, ''),
      nodeLang,
    )
    const parts = langWithoutBraceQueryString.split(':')

    if (!parts[0]) {
      return
    }

    const baseLang = parts[0].trim()
    const { title, ...restParams } = Object.fromEntries(
      new URLSearchParams(parts[1] || '').entries(),
    )

    if (!title) {
      return
    }

    const newClassName = ['gatsby-code-title', ...className]

    const titleNode = {
      type: 'html',
      value: `
        <div class="${newClassName.join(' ').trim()}">
          ${title}
        </div>
       `.trim(),
    }

    const newColonQueryString = Object.keys(restParams).length
      ? ':' + new URLSearchParams(restParams).toString()
      : ''

    markdownAST.children.splice(index, 0, titleNode)

    const newNodeLang = `${baseLang}${braceQueryStrings.join('')}${newColonQueryString}`
    const [newLang, ...newMetas] = newNodeLang.split(' ')

    node.lang = newLang
    node.meta = newMetas.length ? newMetas.join(' ') : null
  })

  return markdownAST
}
