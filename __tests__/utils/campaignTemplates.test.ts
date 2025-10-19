import { describe, it, expect } from 'vitest';
import { CAMPAIGN_TEMPLATES, createCampaignFromTemplate } from '../../utils/campaignTemplates';

describe('campaignTemplates', () => {
  describe('CAMPAIGN_TEMPLATES', () => {
    it('should have templates for all major campaign types', () => {
      expect(CAMPAIGN_TEMPLATES.length).toBeGreaterThan(0);
      
      const categories = new Set(CAMPAIGN_TEMPLATES.map(t => t.category));
      expect(categories).toContain('Sponsored Products');
      expect(categories).toContain('Sponsored Brands');
      expect(categories).toContain('Sponsored Display');
    });

    it('should have valid template structure', () => {
      CAMPAIGN_TEMPLATES.forEach(template => {
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.category).toBeTruthy();
        expect(template.adGroups).toBeInstanceOf(Array);
        expect(template.adGroups.length).toBeGreaterThan(0);
      });
    });

    it('should have suggested daily budgets for most templates', () => {
      const templatesWithBudget = CAMPAIGN_TEMPLATES.filter(t => t.suggestedDailyBudget);
      expect(templatesWithBudget.length).toBeGreaterThan(0);
    });

    it('should have budget percentages that sum to 100 for each template', () => {
      CAMPAIGN_TEMPLATES.forEach(template => {
        const adGroupsWithBudget = template.adGroups.filter(ag => ag.budgetPercent);
        if (adGroupsWithBudget.length > 0) {
          const totalPercent = adGroupsWithBudget.reduce(
            (sum, ag) => sum + (ag.budgetPercent || 0),
            0
          );
          expect(totalPercent).toBe(100);
        }
      });
    });
  });

  describe('createCampaignFromTemplate', () => {
    it('should create a campaign from template with default name', () => {
      const template = CAMPAIGN_TEMPLATES[0];
      const campaign = createCampaignFromTemplate(template);

      expect(campaign.id).toContain('campaign-');
      expect(campaign.name).toBe(template.name);
      expect(campaign.adGroups.length).toBe(template.adGroups.length);
    });

    it('should create a campaign with custom name', () => {
      const template = CAMPAIGN_TEMPLATES[0];
      const customName = 'My Custom Campaign';
      const campaign = createCampaignFromTemplate(template, customName);

      expect(campaign.name).toBe(customName);
    });

    it('should set daily budget when provided', () => {
      const template = CAMPAIGN_TEMPLATES[0];
      const budget = 50;
      const campaign = createCampaignFromTemplate(template, undefined, budget);

      expect(campaign.dailyBudget).toBe(budget);
    });

    it('should use suggested budget when no custom budget provided', () => {
      const template = CAMPAIGN_TEMPLATES.find(t => t.suggestedDailyBudget);
      if (!template) return;

      const campaign = createCampaignFromTemplate(template);

      expect(campaign.dailyBudget).toBe(template.suggestedDailyBudget);
    });

    it('should distribute budget to ad groups based on percentages', () => {
      const template = CAMPAIGN_TEMPLATES.find(
        t => t.suggestedDailyBudget && t.adGroups.every(ag => ag.budgetPercent)
      );
      if (!template) return;

      const budget = 100;
      const campaign = createCampaignFromTemplate(template, undefined, budget);

      campaign.adGroups.forEach((adGroup, index) => {
        const templateAg = template.adGroups[index];
        if (templateAg.budgetPercent) {
          const expectedBudget = (budget * templateAg.budgetPercent) / 100;
          expect(adGroup.budget).toBeCloseTo(expectedBudget, 2);
        }
      });
    });

    it('should copy default match types from template', () => {
      const template = CAMPAIGN_TEMPLATES.find(t =>
        t.adGroups.some(ag => ag.defaultMatchType)
      );
      if (!template) return;

      const campaign = createCampaignFromTemplate(template);

      campaign.adGroups.forEach((adGroup, index) => {
        const templateAg = template.adGroups[index];
        if (templateAg.defaultMatchType) {
          expect(adGroup.defaultMatchType).toBe(templateAg.defaultMatchType);
        }
      });
    });

    it('should copy default bids from template', () => {
      const template = CAMPAIGN_TEMPLATES.find(t =>
        t.adGroups.some(ag => ag.defaultBid)
      );
      if (!template) return;

      const campaign = createCampaignFromTemplate(template);

      campaign.adGroups.forEach((adGroup, index) => {
        const templateAg = template.adGroups[index];
        if (templateAg.defaultBid) {
          expect(adGroup.defaultBid).toBe(templateAg.defaultBid);
        }
      });
    });

    it('should set default bid modifiers for all ad groups', () => {
      const template = CAMPAIGN_TEMPLATES[0];
      const campaign = createCampaignFromTemplate(template);

      campaign.adGroups.forEach(adGroup => {
        expect(adGroup.bidModifiers).toBeDefined();
        expect(adGroup.bidModifiers?.topOfSearch).toBe(50);
        expect(adGroup.bidModifiers?.productPages).toBe(0);
      });
    });

    it('should create unique IDs for campaign and ad groups', async () => {
      const template = CAMPAIGN_TEMPLATES[0];
      const campaign1 = createCampaignFromTemplate(template);
      
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const campaign2 = createCampaignFromTemplate(template);

      expect(campaign1.id).not.toBe(campaign2.id);
      expect(campaign1.adGroups[0].id).not.toBe(campaign2.adGroups[0].id);
    });

    it('should initialize ad groups with empty keyword arrays', () => {
      const template = CAMPAIGN_TEMPLATES[0];
      const campaign = createCampaignFromTemplate(template);

      campaign.adGroups.forEach(adGroup => {
        expect(adGroup.keywords).toEqual([]);
      });
    });
  });

  describe('Specific Templates', () => {
    it('should have SP - Auto Targeting template', () => {
      const template = CAMPAIGN_TEMPLATES.find(t => t.name === 'SP - Auto Targeting');
      expect(template).toBeDefined();
      expect(template?.category).toBe('Sponsored Products');
      expect(template?.adGroups.length).toBeGreaterThan(0);
    });

    it('should have SP - Manual Exact template with exact match type', () => {
      const template = CAMPAIGN_TEMPLATES.find(t => t.name === 'SP - Manual Exact');
      expect(template).toBeDefined();
      
      template?.adGroups.forEach(ag => {
        if (ag.defaultMatchType) {
          expect(ag.defaultMatchType).toBe('Exact');
        }
      });
    });

    it('should have SP - Branded Defense template', () => {
      const template = CAMPAIGN_TEMPLATES.find(t => t.name === 'SP - Branded Defense');
      expect(template).toBeDefined();
      expect(template?.category).toBe('Sponsored Products');
    });

    it('should have Sponsored Brands templates', () => {
      const sbTemplates = CAMPAIGN_TEMPLATES.filter(t => t.category === 'Sponsored Brands');
      expect(sbTemplates.length).toBeGreaterThan(0);
    });

    it('should have Sponsored Display templates', () => {
      const sdTemplates = CAMPAIGN_TEMPLATES.filter(t => t.category === 'Sponsored Display');
      expect(sdTemplates.length).toBeGreaterThan(0);
    });
  });
});
