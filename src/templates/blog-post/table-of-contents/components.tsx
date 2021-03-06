import React from 'react'

import { useTableOfContents } from './hooks'

export type TableOfContentsItemData = {
  url: string
  title: string
  items?: TableOfContentsItemData[]
}

export type TableOfContentsProps = {
  items: TableOfContentsItemData[]
  tags: string[]
  url: string
  className?: string | undefined
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  tags,
  url,
  className,
}) => {
  const [activeIndexId, setActiveIndexId] = useTableOfContents(tags, url)
  return (
    <ul className={className}>
      {items.map((item: any) => (
        <TableOfContentsItem
          key={item.url}
          data={item}
          activeIndexId={activeIndexId}
          onClick={setActiveIndexId(100)}
          maxDepth={tags.length - 1}
        />
      ))}
    </ul>
  )
}

const TableOfContentsItem: React.FC<{
  data: TableOfContentsItemData
  activeIndexId?: string | undefined
  onClick?: ((activeIndexId: string) => void) | undefined
  maxDepth?: number
  depth?: number
}> = ({
  data: { title, url: idWithHash, items },
  activeIndexId,
  onClick,
  maxDepth = 0,
  depth = 0,
}) => {
  return (
    <li>
      <a
        id={`toc__${idWithHash.replace(/^#/, '')}`}
        href={idWithHash}
        className={activeIndexId === idWithHash ? 'active' : ''}
        onClick={(e) => {
          e.preventDefault()
          onClick?.(idWithHash)
          const elem = document.getElementById(idWithHash.replace(/^#/, ''))
          elem?.scrollIntoView()
        }}
        style={depth === 0 ? { fontWeight: '600' } : {}}
      >
        {title}
      </a>
      {/* make maxDepth larger than 0 to render h3, h4 and so on. */}
      {items && depth < maxDepth && (
        <ul style={{ paddingLeft: `${(depth + 1) * 16}px` }}>
          {items.map((item) => (
            <TableOfContentsItem
              key={item.url}
              data={item}
              activeIndexId={activeIndexId}
              onClick={onClick}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
