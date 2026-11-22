import { afterEach, describe, expect, it, vi } from 'vitest';
import { solveSecretSanta, UnsatisfiableSecretSantaError } from './secretSanta.js';

/** @param {Record<string, string[]>} rules */
const group = (rules) => {
  const users = Object.entries(rules).map(([id, forbidden]) => ({
    id,
    name: id,
    email: `${id}@example.com`,
    forbidden,
  }));
  return { id: 'group', name: 'Test group', users };
};

/** @param {{ users: { id: string, forbidden: string[] }[] }} santa @param {Map<any, any>} assignments */
const assertValid = ({ users }, assignments) => {
  expect(assignments).toBeInstanceOf(Map);
  expect(assignments.size).toBe(users.length);
  expect(new Set([...assignments.values()].map(({ id }) => id)).size).toBe(users.length);
  for (const [giver, giftee] of assignments) {
    expect(giftee.id).not.toBe(giver.id);
    expect(giver.forbidden).not.toContain(giftee.id);
    expect(assignments.get(giftee)).not.toBe(giver);
  }
};

afterEach(() => vi.restoreAllMocks());

describe('solveSecretSanta', () => {
  it.each([3, 4, 8])('assigns each participant in a group of %i exactly once', (size) => {
    const participants = Object.fromEntries(
      Array.from({ length: size }, (_, i) => [`user-${i}`, []]),
    );
    const santa = group(participants);

    assertValid(santa, solveSecretSanta(santa));
  });

  it('solves highly constrained groups', () => {
    const santa = group({
      a: ['a', 'c', 'd'],
      b: ['a', 'b', 'd'],
      c: ['a', 'b', 'c'],
      d: ['b', 'c', 'd'],
    });

    assertValid(santa, solveSecretSanta(santa));
  });

  it('backtracks when the first randomized greedy choice leads to a dead end', () => {
    const santa = group({ a: ['d'], b: ['a', 'b'], c: ['b', 'c'], d: ['b', 'd'] });
    const original = JSON.stringify(santa.users);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const assignments = solveSecretSanta(santa);
    assertValid(santa, assignments);
    expect(JSON.stringify(santa.users)).toBe(original);
  });

  it('reports impossible constraints with a typed error', () => {
    const santa = group({ a: ['b'], b: ['a'] });

    expect(() => solveSecretSanta(santa)).toThrow(UnsatisfiableSecretSantaError);
    expect(() => solveSecretSanta(santa)).toThrow(/No valid Secret Santa assignment/);
  });

  it('prevents reciprocal pairs', () => {
    const santa = group({ a: [], b: [], c: [] });
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const assignments = solveSecretSanta(santa);
    assertValid(santa, assignments);
  });
});
