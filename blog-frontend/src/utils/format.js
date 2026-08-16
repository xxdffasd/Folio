import { format } from 'date-fns';

// Consistent date format everywhere a post's createdAt is shown —
// e.g. "Jul 6, 2026". Centralizing this means a single place to change
// the format later (e.g. to relative "3 days ago") without hunting through pages.
export const formatPostDate = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMM d, yyyy');
};

// Strips HTML tags from rich-text `content` so the feed can show a plain-text
// excerpt (line-clamp handles the truncation visually; this just removes markup
// so stray tags/attributes never leak into the card).
export const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
