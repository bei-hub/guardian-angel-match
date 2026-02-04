
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  generateMatches, 
  isMemberValid, 
  getGuardianTarget,
  getLocalUserIdentity,
  setLocalUserIdentity
} from '../lib/wishGuardian';

describe('WishGuardian Core Logic', () => {
  describe('generateMatches', () => {
    it('should throw error for less than 2 members', () => {
      expect(() => generateMatches(['Alice'])).toThrow();
    });

    it('should generate valid matches for 2 members', () => {
      const members = ['Alice', 'Bob'];
      const matches = generateMatches(members);
      expect(matches['Alice']).toBe('Bob');
      expect(matches['Bob']).toBe('Alice');
    });

    it('should generate valid matches for 3 members', () => {
      const members = ['A', 'B', 'C'];
      const matches = generateMatches(members);
      
      // Check all members are keys
      expect(Object.keys(matches)).toHaveLength(3);
      
      // Check no one matches themselves
      members.forEach(m => {
        expect(matches[m]).not.toBe(m);
      });
      
      // Check all values are unique members
      const values = Object.values(matches);
      expect(new Set(values).size).toBe(3);
    });
  });

  describe('isMemberValid', () => {
    const members = ['Alice', 'Bob'];

    it('should return true for existing member', () => {
      expect(isMemberValid('Alice', members)).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(isMemberValid('alice', members)).toBe(true);
      expect(isMemberValid('ALICE', members)).toBe(true);
    });

    it('should return false for non-member', () => {
      expect(isMemberValid('Charlie', members)).toBe(false);
    });
  });

  describe('getGuardianTarget', () => {
    const members = ['Alice', 'Bob'];
    const matches = { 'Alice': 'Bob', 'Bob': 'Alice' };

    it('should return target for valid member', () => {
      expect(getGuardianTarget('Alice', members, matches)).toBe('Bob');
    });

    it('should be case insensitive', () => {
      expect(getGuardianTarget('alice', members, matches)).toBe('Bob');
    });

    it('should return null for invalid member', () => {
      expect(getGuardianTarget('Charlie', members, matches)).toBe(null);
    });
  });

  describe('Local Identity (localStorage)', () => {
    beforeEach(() => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should set local user identity', () => {
      setLocalUserIdentity('Alice');
      expect(localStorage.setItem).toHaveBeenCalledWith('wish-guardian-user-identity', 'Alice');
    });

    it('should get local user identity', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('Alice');
      expect(getLocalUserIdentity()).toBe('Alice');
    });
  });
});
