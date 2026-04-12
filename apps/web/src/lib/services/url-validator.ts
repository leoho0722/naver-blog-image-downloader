const NAVER_BLOG_REGEX = /^https:\/\/(m\.)?blog\.naver\.com\//;

export function isValid(url: string): boolean {
  return NAVER_BLOG_REGEX.test(url);
}

export function normalize(url: string): string {
  return url.replace("://m.blog.naver.com/", "://blog.naver.com/");
}
