/**
 * Converts a text string into an SEO-friendly URL slug.
 */
export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '') // remove apostrophes
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // remove non-word characters
    .replace(/--+/g, '-') // replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // trim starting hyphen
    .replace(/-+$/, ''); // trim ending hyphen
};
