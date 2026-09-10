import { describe, expect, it } from 'vitest';
import { techIcons, techIconFor, type TechIcon } from '../../src/data/tech-icons';

describe('tech icons', () => {
  it('exposes at least the core project technologies', () => {
    for (const key of ['go', 'python', 'typescript', 'astro', 'pytorch']) {
      expect(techIcons[key]).toBeTruthy();
    }
  });

  it('every icon has a non-empty title and an SVG path', () => {
    for (const [key, icon] of Object.entries(techIcons)) {
      expect(key, `key ${key}`).toMatch(/^[a-z0-9-]+$/);
      expect(icon.title, key).toBeTruthy();
      expect(icon.path, key).toBeTruthy();
      expect(icon.path!.charAt(0), key).toMatch(/[A-Za-z0-9]/);
    }
  });

  it('stores a valid hex for each icon', () => {
    for (const [key, icon] of Object.entries(techIcons)) {
      expect(icon.hex, key).toMatch(/^[0-9A-F]{6}$/);
    }
  });

  it('looks up icons case-insensitively', () => {
    expect(techIconFor('python')).toBe(techIcons.python);
    expect(techIconFor('Python')).toBe(techIcons.python);
    expect(techIconFor('  Go  ')).toBe(techIcons.go);
  });

  it('returns null for unlisted technologies', () => {
    expect(techIconFor('COBOL')).toBeNull();
    expect(techIconFor('')).toBeNull();
  });

  it('exposes well-typed records', () => {
    const icon: TechIcon = techIcons.python;
    expect(typeof icon.path).toBe('string');
    expect(typeof icon.title).toBe('string');
    expect(typeof icon.hex).toBe('string');
  });
});
