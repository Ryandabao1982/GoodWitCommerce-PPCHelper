/**
 * Tests for Naming Convention Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateCampaignName,
  generateCampaignName,
  parseCampaignName,
  validateStageThemeMapping,
  validateTypeMatchMapping,
  validateDateCode,
  getCurrentDateCode,
  formatBrandName,
} from '../../utils/namingConvention';
import type { CampaignNamingComponents } from '../../types';

describe('namingConvention', () => {
  describe('formatBrandName', () => {
    it('should convert to uppercase', () => {
      expect(formatBrandName('nike')).toBe('NIKE');
    });

    it('should remove special characters', () => {
      expect(formatBrandName('nike-pro')).toBe('NIKEPRO');
      expect(formatBrandName('nike & co')).toBe('NIKECO');
    });

    it('should limit to 20 characters', () => {
      expect(formatBrandName('verylongbrandnamethatexceeds')).toHaveLength(20);
    });
  });

  describe('generateCampaignName', () => {
    it('should generate valid campaign name', () => {
      const components: CampaignNamingComponents = {
        brand: 'NIKE',
        country: 'US',
        stage: 'L',
        type: 'SP',
        match: 'AUTO',
        theme: 'RESEARCH',
        dateCode: '202510',
      };

      const name = generateCampaignName(components);
      expect(name).toBe('NIKE_US_L_SP_AUTO_RESEARCH_202510');
    });
  });

  describe('validateCampaignName', () => {
    it('should validate correct campaign name', () => {
      const result = validateCampaignName('NIKE_US_L_SP_AUTO_RESEARCH_202510');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.components).toBeDefined();
    });

    it('should reject empty name', () => {
      const result = validateCampaignName('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid format', () => {
      const result = validateCampaignName('INVALID_NAME');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid stage-theme mapping', () => {
      // Launch (L) should not use REMARKETING
      const result = validateCampaignName('NIKE_US_L_SP_AUTO_REMARKETING_202510');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('stage-theme'))).toBe(true);
    });

    it('should reject invalid type-match mapping', () => {
      // SD campaigns cannot use EXACT match
      const result = validateCampaignName('NIKE_US_S_SD_EXACT_AWARENESS_202510');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('type-match'))).toBe(true);
    });

    it('should warn about AUTO campaigns not in RESEARCH', () => {
      const result = validateCampaignName('NIKE_US_O_SP_AUTO_PERFORMANCE_202510');
      expect(result.warnings.some((w) => w.includes('AUTO'))).toBe(true);
    });
  });

  describe('parseCampaignName', () => {
    it('should parse valid campaign name', () => {
      const components = parseCampaignName('NIKE_US_L_SP_AUTO_RESEARCH_202510');
      expect(components).toBeDefined();
      expect(components?.brand).toBe('NIKE');
      expect(components?.country).toBe('US');
      expect(components?.stage).toBe('L');
      expect(components?.type).toBe('SP');
      expect(components?.match).toBe('AUTO');
      expect(components?.theme).toBe('RESEARCH');
      expect(components?.dateCode).toBe('202510');
    });

    it('should return null for invalid name', () => {
      const components = parseCampaignName('INVALID_NAME');
      expect(components).toBeNull();
    });
  });

  describe('validateStageThemeMapping', () => {
    it('should allow valid mappings', () => {
      expect(validateStageThemeMapping('L', 'RESEARCH').isValid).toBe(true);
      expect(validateStageThemeMapping('O', 'PERFORMANCE').isValid).toBe(true);
      expect(validateStageThemeMapping('S', 'AWARENESS').isValid).toBe(true);
      expect(validateStageThemeMapping('M', 'BRANDED').isValid).toBe(true);
    });

    it('should reject invalid mappings', () => {
      expect(validateStageThemeMapping('L', 'REMARKETING').isValid).toBe(false);
      expect(validateStageThemeMapping('M', 'RESEARCH').isValid).toBe(false);
    });
  });

  describe('validateTypeMatchMapping', () => {
    it('should allow valid mappings', () => {
      expect(validateTypeMatchMapping('SP', 'AUTO').isValid).toBe(true);
      expect(validateTypeMatchMapping('SP', 'BROAD').isValid).toBe(true);
      expect(validateTypeMatchMapping('SB', 'VIDEO').isValid).toBe(true);
      expect(validateTypeMatchMapping('SD', 'BROAD').isValid).toBe(true);
    });

    it('should reject invalid mappings', () => {
      expect(validateTypeMatchMapping('SB', 'AUTO').isValid).toBe(false);
      expect(validateTypeMatchMapping('SD', 'EXACT').isValid).toBe(false);
      expect(validateTypeMatchMapping('SD', 'VIDEO').isValid).toBe(false);
    });
  });

  describe('validateDateCode', () => {
    it('should validate correct date codes', () => {
      expect(validateDateCode('202510').isValid).toBe(true);
      expect(validateDateCode('202501').isValid).toBe(true);
      expect(validateDateCode('202512').isValid).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validateDateCode('2025').isValid).toBe(false);
      expect(validateDateCode('20251').isValid).toBe(false);
      expect(validateDateCode('2025100').isValid).toBe(false);
    });

    it('should reject invalid months', () => {
      expect(validateDateCode('202500').isValid).toBe(false);
      expect(validateDateCode('202513').isValid).toBe(false);
    });

    it('should reject invalid years', () => {
      expect(validateDateCode('201901').isValid).toBe(false);
      expect(validateDateCode('203001').isValid).toBe(false);
    });
  });

  describe('getCurrentDateCode', () => {
    it('should return date code in YYYYMM format', () => {
      const dateCode = getCurrentDateCode();
      expect(dateCode).toMatch(/^\d{6}$/);
      expect(validateDateCode(dateCode).isValid).toBe(true);
    });
  });
});
