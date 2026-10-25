export function coverPaletteIndex(isbn: string): number {
  let h = 0;
  for (let i = 0; i < isbn.length; i++) h = (h * 31 + isbn.charCodeAt(i)) >>> 0;
  return (h % 7) + 1;
}

export function formatAuthors(authors: string[]): string {
  if (authors.length <= 2) return authors.join(", ");
  return `${authors[0]}, ${authors[1]} +${authors.length - 2}`;
}
