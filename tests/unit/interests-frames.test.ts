import { describe, expect, it } from 'vitest';
import { FRAME_PALETTE, frameFor } from '../../src/lib/interests-frames';

const HEX = /^#[0-9a-fA-F]{6}$/;

describe('FRAME_PALETTE', () => {
  it('exposes six frames', () => {
    expect(FRAME_PALETTE).toHaveLength(6);
  });

  it('uses valid 6-digit hex values', () => {
    for (const color of FRAME_PALETTE) {
      expect(color, color).toMatch(HEX);
    }
  });

  it('contains no duplicates', () => {
    expect(new Set(FRAME_PALETTE).size).toBe(FRAME_PALETTE.length);
  });
});

describe('frameFor', () => {
  it('maps the first indexes to the palette in order', () => {
    FRAME_PALETTE.forEach((color, index) => {
      expect(frameFor(index)).toBe(color);
    });
  });

  it('wraps around past the palette length', () => {
    expect(frameFor(FRAME_PALETTE.length)).toBe(FRAME_PALETTE[0]);
    expect(frameFor(FRAME_PALETTE.length + 1)).toBe(FRAME_PALETTE[1]);
    expect(frameFor(FRAME_PALETTE.length * 3 + 2)).toBe(FRAME_PALETTE[2]);
  });

  it('stays inside the palette for a large index range', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(FRAME_PALETTE, `index ${i}`).toContain(frameFor(i));
    }
  });

  it('treats negative indexes by wrapping', () => {
    expect(frameFor(-1)).toBe(FRAME_PALETTE[FRAME_PALETTE.length - 1]);
  });

  it('falls back to the first frame for non-finite input', () => {
    expect(frameFor(Number.NaN)).toBe(FRAME_PALETTE[0]);
    expect(frameFor(Number.POSITIVE_INFINITY)).toBe(FRAME_PALETTE[0]);
  });
});
