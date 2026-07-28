/**
 * Strips Markdown syntax (#, *, `, [], etc.) from text to produce clean plain text for snippets and previews.
 */
export const stripMarkdown = (markdown) => {
  if (!markdown) return '';
  return markdown
    .toString()
    // Remove headers (#, ##, ###, etc.)
    .replace(/^#+\s+/gm, '')
    // Remove code blocks (```...```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code (`...`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove images (![alt](url))
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links ([text](url) -> text)
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    // Remove bold/italic (**text**, *text*, __text__, _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    // Remove bold/italic single (*text* or _text_)
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove blockquotes (> text)
    .replace(/^>\s+/gm, '')
    // Remove unordered list bullets (- item, * item, + item)
    .replace(/^[\*\-+]\s+/gm, '')
    // Remove ordered list numbers (1. item)
    .replace(/^\d+\.\s+/gm, '')
    // Remove horizontal rules (---, ___, ***)
    .replace(/^(---|\*\*\*|___)\s*$/gm, '')
    // Collapse multiple newlines/spaces into a single space
    .replace(/\s+/g, ' ')
    .trim();
};
