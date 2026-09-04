import { sectionPath } from '../i18n';
import { contentPath } from './urls';
import type { Lang, Section } from './types';

export interface LanguageSwitchInput {
  targetLang: Lang;
  section: Section;
  translatedSlug?: string;
}

export function languageSwitchTarget(input: LanguageSwitchInput): string {
  return input.translatedSlug
    ? contentPath(input.targetLang, input.translatedSlug)
    : sectionPath(input.targetLang, input.section);
}
