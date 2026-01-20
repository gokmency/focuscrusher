/**
 * Transforms a string into a Bionic Reading HTML string.
 * Wraps the start of words in <b> tags.
 * We use <b> tags so we can control the visual "boldness" via CSS (using text-shadow)
 * without affecting the layout width of the characters, which is crucial for PDF alignment.
 */
export const toBionicHTML = (text: string): string => {
  if (!text) return '';

  // Split by whitespace but keep delimiters
  const parts = text.split(/(\s+)/);

  return parts.map(part => {
    // Pass through whitespace exactly as is
    if (/^\s+$/.test(part)) {
      return part;
    }

    const length = part.length;
    
    // Single characters: Bold it
    if (length <= 1) {
      return `<b>${part}</b>`;
    }

    // Bionic Logic: Bold first 40%
    const boldLength = Math.ceil(length * 0.4); 
    const boldPart = part.substring(0, boldLength);
    const regularPart = part.substring(boldLength);

    return `<b>${boldPart}</b>${regularPart}`;
  }).join('');
};

export const toBionic = (text: string) => {
    console.warn("toBionic (JSX) is deprecated. Use toBionicHTML.");
    return text; 
}