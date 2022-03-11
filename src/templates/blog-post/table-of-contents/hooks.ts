import { useEffect, useState, useCallback } from 'react'

export const useTableOfContents = (tags: string[], url: string) => {
  const selector = tags.join(',')
  const [activeIndexId, _setActiveIndexId] = useState<string>()

  const setActiveIndexId = (delay?: number) =>
    useCallback(
      (idOrHash: string) => {
        idOrHash = idOrHash.startsWith('#') ? idOrHash : `#${idOrHash}`
        const handle = () => {
          _setActiveIndexId(idOrHash)
          history.pushState(null, '', idOrHash)
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
