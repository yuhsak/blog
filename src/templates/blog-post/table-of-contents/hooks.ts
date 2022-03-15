import { useEffect, useState, useCallback } from 'react'

export const useTableOfContents = (tags: string[], url: string) => {
  const selector = tags.join(',')
  const [activeIndexId, _setActiveIndexId] = useState<string>()

  const setActiveIndexId = (delay?: number) =>
    useCallback(
      (idWithOrWithoutHash: string) => {
        const idWithHash = idWithOrWithoutHash.startsWith('#')
          ? idWithOrWithoutHash
          : `#${idWithOrWithoutHash}`
        const handle = () => {
          _setActiveIndexId(idWithHash)
          const toc = document.querySelector<HTMLElement>('.table-of-contents')
          const tocIndex = document.getElementById(`toc__${idWithHash.replace(/^#/, '')}`)
          if (toc && tocIndex) {
            const upper = toc.scrollTop
            const lower = upper + toc.offsetHeight
            const top = tocIndex.offsetTop
            const bottom = top + tocIndex.offsetHeight
            if (top < upper) {
              toc.scrollTop = top
            } else if (lower < bottom) {
              toc.scrollTop = tocIndex.offsetTop - toc.offsetHeight + tocIndex.offsetHeight
            }
          }
        }
        const exec = delay ? () => setTimeout(handle, delay) : handle
        exec()
      },
      [delay, _setActiveIndexId],
    )

  const handle = setActiveIndexId()

  useEffect(() => {
    const headings = document.querySelectorAll(selector)

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
        threshold: 0,
      },
    )

    headings.forEach(observer.observe.bind(observer))

    return () => {
      observer.disconnect()
    }
  }, [selector, url, handle])

  return [activeIndexId, setActiveIndexId] as const
}
