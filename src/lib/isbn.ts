import { hyphenate } from "isbn3";

export const formatIsbn = (code: string) => hyphenate(code)?.replaceAll("-", " ") || code;
