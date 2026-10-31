const CYRILLIC = /\p{Script=Cyrillic}/u;
const LATVIAN = /[āčēģīķļņšūž]/i;

export const textLang = (text: string) =>
  CYRILLIC.test(text) ? "ru" : LATVIAN.test(text) ? "lv" : undefined;
