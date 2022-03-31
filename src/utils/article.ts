type Article = {
  frontmatter: {
    title: string
    description: string
    date: string
    category: string
    isDraft: boolean | null
  }
}

export const isPublished = <T extends Article>({
  frontmatter: { title, date, category, isDraft },
}: T) => !!title && !!date && !!category && !isDraft
