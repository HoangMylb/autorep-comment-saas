function stripVietnamese(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeForMatch(input: string) {
  return stripVietnamese(input).toLowerCase().trim().replace(/\s+/g, " ");
}

export function matchKeyword(commentMessage: string, keywords: string[]) {
  const normalizedComment = normalizeForMatch(commentMessage);
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeForMatch(keyword);
    if (normalizedKeyword && normalizedComment.includes(normalizedKeyword)) {
      return keyword;
    }
  }
  return null;
}
