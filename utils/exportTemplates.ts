import { Campaign, KeywordData, ASIN } from '../types';

export interface AmazonBulkUploadRow {
  'Campaign Name': string;
  'Ad Group Name': string;
  'Keyword or Product Targeting': string;
  'Match Type': string;
  'Bid': string;
  'Campaign Daily Budget': string;
  'Campaign Start Date': string;
  'Campaign End Date': string;
  'Targeting Type': string;
  'Campaign Status': string;
  'Ad Group Default Bid': string;
}

/**
 * Export campaigns in Amazon Sponsored Products bulk upload format
 */
export function exportCampaignsToAmazonBulk(
  campaigns: Campaign[]
): string {
  const headers = [
    'Campaign Name',
    'Ad Group Name',
    'Keyword or Product Targeting',
    'Match Type',
    'Bid',
    'Campaign Daily Budget',
    'Campaign Start Date',
    'Campaign End Date',
    'Targeting Type',
    'Campaign Status',
    'Ad Group Default Bid'
  ];

  const rows: string[][] = [headers];

  // Add campaign header rows
  campaigns.forEach(campaign => {
    campaign.adGroups.forEach(adGroup => {
      adGroup.keywords.forEach(keyword => {
        rows.push([
          campaign.name,
          adGroup.name,
          keyword,
          adGroup.defaultMatchType || 'Broad',
          adGroup.defaultBid?.toFixed(2) || '1.00',
          campaign.dailyBudget?.toFixed(2) || '',
          '', // Start date - leave empty for immediate start
          '', // End date - leave empty for no end
          'Manual',
          'Enabled',
          adGroup.defaultBid?.toFixed(2) || '1.00'
        ]);
      });
    });
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Export keywords in enhanced format with all metadata
 */
export function exportKeywordsEnhanced(
  keywords: KeywordData[],
  brandName: string
): string {
  const headers = [
    'Keyword',
    'Type',
    'Category',
    'Search Volume',
    'Competition',
    'Relevance Score',
    'Source',
    'Suggested Bid (Low)',
    'Suggested Bid (Mid)',
    'Suggested Bid (High)',
    'Notes'
  ];

  const rows: string[][] = [headers];

  keywords.forEach(kw => {
    // Calculate suggested bids based on competition
    let bidLow = '0.50';
    let bidMid = '1.00';
    let bidHigh = '2.00';

    if (kw.competition === 'High') {
      bidLow = '1.50';
      bidMid = '2.50';
      bidHigh = '4.00';
    } else if (kw.competition === 'Medium') {
      bidLow = '1.00';
      bidMid = '1.75';
      bidHigh = '3.00';
    }

    const notes = [];
    if (kw.relevance >= 8) notes.push('High Relevance');
    if (kw.category === 'Branded') notes.push('Brand Defense');
    if (kw.type === 'Long-tail') notes.push('Low Competition Opportunity');

    rows.push([
      kw.keyword,
      kw.type,
      kw.category,
      kw.searchVolume,
      kw.competition,
      kw.relevance.toString(),
      kw.source,
      bidLow,
      bidMid,
      bidHigh,
      notes.join('; ')
    ]);
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Export campaign structure with detailed analysis
 */
export function exportCampaignAnalysis(
  campaigns: Campaign[],
  keywords: KeywordData[],
  brandName: string
): string {
  const lines: string[] = [];
  
  lines.push(`Campaign Analysis Report - ${brandName}`);
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  lines.push('');
  lines.push('='.repeat(80));
  lines.push('');

  campaigns.forEach(campaign => {
    lines.push(`Campaign: ${campaign.name}`);
    lines.push(`Daily Budget: $${campaign.dailyBudget?.toFixed(2) || 'Not Set'}`);
    lines.push(`Total Ad Groups: ${campaign.adGroups.length}`);
    
    let totalKeywords = 0;
    campaign.adGroups.forEach(ag => {
      totalKeywords += ag.keywords.length;
    });
    
    lines.push(`Total Keywords: ${totalKeywords}`);
    lines.push('');
    
    campaign.adGroups.forEach(adGroup => {
      lines.push(`  Ad Group: ${adGroup.name}`);
      lines.push(`  Default Bid: $${adGroup.defaultBid?.toFixed(2) || 'Not Set'}`);
      lines.push(`  Match Type: ${adGroup.defaultMatchType || 'Not Set'}`);
      lines.push(`  Keywords (${adGroup.keywords.length}):`);
      
      adGroup.keywords.forEach(kw => {
        const kwData = keywords.find(k => k.keyword.toLowerCase() === kw.toLowerCase());
        if (kwData) {
          lines.push(`    - ${kw} (Vol: ${kwData.searchVolume}, Comp: ${kwData.competition})`);
        } else {
          lines.push(`    - ${kw}`);
        }
      });
      
      lines.push('');
    });
    
    lines.push('-'.repeat(80));
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Export ASINs with campaign associations
 */
export function exportASINsWithCampaigns(
  asins: ASIN[],
  campaigns: Campaign[],
  asinToCampaignMaps: { asinId: string; campaignIds: string[] }[],
  brandName: string
): string {
  const headers = [
    'ASIN',
    'Product Title',
    'SKU',
    'Price',
    'Status',
    'Linked Campaigns',
    'Campaign Count',
    'Added Date'
  ];

  const rows: string[][] = [headers];

  asins.forEach(asin => {
    const map = asinToCampaignMaps.find(m => m.asinId === asin.id);
    const linkedCampaignNames = map
      ? map.campaignIds
          .map(id => campaigns.find(c => c.id === id)?.name)
          .filter(Boolean)
          .join('; ')
      : '';

    rows.push([
      asin.asin,
      asin.title,
      asin.sku || '',
      asin.price ? `$${asin.price.toFixed(2)}` : '',
      asin.isActive ? 'Active' : 'Inactive',
      linkedCampaignNames,
      (map?.campaignIds.length || 0).toString(),
      new Date(asin.createdAt).toLocaleDateString()
    ]);
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Export comprehensive brand report
 */
export function exportBrandReport(
  brandName: string,
  campaigns: Campaign[],
  keywords: KeywordData[],
  asins: ASIN[],
  asinToCampaignMaps: { asinId: string; campaignIds: string[] }[]
): string {
  const lines: string[] = [];
  
  lines.push(`Brand Report: ${brandName}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('='.repeat(80));
  lines.push('');
  
  // Summary
  lines.push('SUMMARY');
  lines.push('-'.repeat(80));
  lines.push(`Total Campaigns: ${campaigns.length}`);
  lines.push(`Total Keywords: ${keywords.length}`);
  lines.push(`Total ASINs: ${asins.length}`);
  
  const totalAdGroups = campaigns.reduce((sum, c) => sum + c.adGroups.length, 0);
  lines.push(`Total Ad Groups: ${totalAdGroups}`);
  
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.dailyBudget || 0), 0);
  lines.push(`Total Daily Budget: $${totalBudget.toFixed(2)}`);
  lines.push('');
  
  // Keyword breakdown
  lines.push('KEYWORD BREAKDOWN');
  lines.push('-'.repeat(80));
  
  const byType: Record<string, number> = {};
  const byCompetition: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  
  keywords.forEach(kw => {
    byType[kw.type] = (byType[kw.type] || 0) + 1;
    byCompetition[kw.competition] = (byCompetition[kw.competition] || 0) + 1;
    byCategory[kw.category] = (byCategory[kw.category] || 0) + 1;
  });
  
  lines.push('By Type:');
  Object.entries(byType).forEach(([type, count]) => {
    lines.push(`  ${type}: ${count} (${((count / keywords.length) * 100).toFixed(1)}%)`);
  });
  
  lines.push('');
  lines.push('By Competition:');
  Object.entries(byCompetition).forEach(([comp, count]) => {
    lines.push(`  ${comp}: ${count} (${((count / keywords.length) * 100).toFixed(1)}%)`);
  });
  
  lines.push('');
  lines.push('By Category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    lines.push(`  ${cat}: ${count} (${((count / keywords.length) * 100).toFixed(1)}%)`);
  });
  
  lines.push('');
  lines.push('='.repeat(80));
  
  return lines.join('\n');
}
