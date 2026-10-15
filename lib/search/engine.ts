import { VisualAsset, SearchFilter, SearchResult } from '@/types';
import { expandVisualSearchQuery } from '@/lib/ai/vision';

/**
 * Natural-Language Visual Content Search Engine
 * Prioritizes what is VISUALLY inside the image (servers, cables, desks, keyboards, scenery, invoice lines)
 * rather than relying on filenames.
 */
export async function searchAssets(
  assets: VisualAsset[],
  filter: SearchFilter
): Promise<SearchResult[]> {
  const query = filter.query?.trim() || '';

  // 1. Basic category, collection, status, and date filters
  let filtered = assets.filter((asset) => {
    if (filter.category && filter.category !== 'all' && asset.category !== filter.category) {
      return false;
    }
    if (filter.collectionId && !asset.collectionIds?.includes(filter.collectionId)) {
      return false;
    }
    if (filter.status && filter.status !== 'all' && asset.status !== filter.status) {
      return false;
    }
    if (filter.dateRange && filter.dateRange !== 'all') {
      const assetDate = new Date(asset.createdAt).getTime();
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      if (filter.dateRange === 'today' && now - assetDate > day) return false;
      if (filter.dateRange === 'week' && now - assetDate > 7 * day) return false;
      if (filter.dateRange === 'month' && now - assetDate > 30 * day) return false;
      if (filter.dateRange === 'year' && now - assetDate > 365 * day) return false;
    }
    return true;
  });

  if (!query) {
    const results: SearchResult[] = filtered.map((asset) => ({
      asset,
      relevanceScore: 100,
      matchReason: 'Active filter view',
      matchType: 'keyword',
    }));
    return sortResults(results, filter.sortBy);
  }

  // 2. Perform Semantic Visual Query Expansion (e.g. "a room full of servers with cables" -> data center, cables, racks, switches)
  const expandedConcepts = await expandVisualSearchQuery(query);
  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery
    .replace(/[^a-z0-9\s$]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !['the', 'and', 'with', 'for', 'from', 'that', 'this', 'have', 'look', 'like', 'show'].includes(t));

  const scoredResults: SearchResult[] = [];

  for (const asset of filtered) {
    let score = 0;
    let matchType: SearchResult['matchType'] = 'keyword';
    let matchReason = '';
    let highlightSnippet = '';

    const description = (asset.description || '').toLowerCase();
    const ocrText = (asset.ocrText || '').toLowerCase();
    const tags = (asset.tags || []).map((t) => t.toLowerCase());
    const visualContentPool = `${description} ${tags.join(' ')} ${ocrText}`;

    // A. Check Semantic Concept Matches from query expansion (What the user remembers seeing, including typo corrections)
    const matchingConcepts = expandedConcepts.filter((concept) => {
      const lowerC = concept.toLowerCase().trim();
      if (!lowerC || lowerC.length < 3) return false;

      // Direct phrase match
      if (visualContentPool.includes(lowerC)) return true;

      // Multi-word concept match: require all significant words to match
      const words = lowerC.split(/\s+/).filter((w) => w.length > 2 && !['and', 'the', 'with', 'for'].includes(w));
      if (words.length > 1) {
        return words.every((w) => visualContentPool.includes(w));
      } else if (words.length === 1) {
        return visualContentPool.includes(words[0]);
      }
      return false;
    });

    if (matchingConcepts.length > 0) {
      const conceptScore = Math.min(98, 70 + matchingConcepts.length * 10);
      if (conceptScore > score) {
        score = conceptScore;
        matchType = 'semantic';
        matchReason = `Visual match: identified "${matchingConcepts.slice(0, 3).join(', ')}"`;
        const firstMatch = matchingConcepts[0];
        const idx = description.indexOf(firstMatch);
        if (idx !== -1) {
          highlightSnippet = `...${description.slice(Math.max(0, idx - 20), Math.min(description.length, idx + 60))}...`;
        }
      }
    }

    // B. Direct Content / Description Token Overlap (combining query tokens & expanded concepts)
    const allSearchTokens = Array.from(new Set([
      ...queryTokens,
      ...expandedConcepts.filter((c) => c.length > 2)
    ]));

    const matchingQueryTokens = allSearchTokens.filter((token) => {
      return description.includes(token) || tags.some((t) => t.includes(token)) || ocrText.includes(token);
    });

    if (matchingQueryTokens.length > 0) {
      const overlapRatio = matchingQueryTokens.length / Math.max(1, allSearchTokens.length);
      const descScore = Math.round(55 + overlapRatio * 40);
      if (descScore > score) {
        score = descScore;
        matchType = 'semantic';
        matchReason = `Visual content matches: "${matchingQueryTokens.slice(0, 4).join(', ')}"`;
        const firstToken = matchingQueryTokens[0];
        const idx = description.indexOf(firstToken);
        if (idx !== -1) {
          highlightSnippet = `...${description.slice(Math.max(0, idx - 20), Math.min(description.length, idx + 60))}...`;
        }
      }
    }

    // C. Exact phrase in description
    if (description.includes(normalizedQuery)) {
      if (score < 96) {
        score = 96;
        matchType = 'semantic';
        matchReason = 'Visual scene description explicitly matches your phrase';
        const idx = description.indexOf(normalizedQuery);
        highlightSnippet = `...${description.slice(Math.max(0, idx - 20), Math.min(description.length, idx + normalizedQuery.length + 40))}...`;
      }
    }

    // D. OCR Detected text inside the image (crucial for receipts, invoices, code, diagrams)
    if (ocrText) {
      if (ocrText.includes(normalizedQuery)) {
        if (score < 95) {
          score = 95;
          matchType = 'ocr';
          matchReason = 'Detected visible text inside image matches query';
          const idx = ocrText.indexOf(normalizedQuery);
          highlightSnippet = `...${asset.ocrText!.slice(Math.max(0, idx - 25), Math.min(asset.ocrText!.length, idx + normalizedQuery.length + 35))}...`;
        }
      } else {
        const matchingOcrTokens = queryTokens.filter((token) => ocrText.includes(token));
        if (matchingOcrTokens.length > 0) {
          const ocrScore = Math.round(60 + (matchingOcrTokens.length / queryTokens.length) * 30);
          if (ocrScore > score) {
            score = ocrScore;
            matchType = 'ocr';
            matchReason = `Visible text in image contains "${matchingOcrTokens.join(', ')}"`;
            const firstIdx = ocrText.indexOf(matchingOcrTokens[0]);
            highlightSnippet = `...${asset.ocrText!.slice(Math.max(0, firstIdx - 20), Math.min(asset.ocrText!.length, firstIdx + 50))}...`;
          }
        }
      }
    }

    // E. Fallback: Filename match (low weight compared to visual content)
    if (asset.originalFilename.toLowerCase().includes(normalizedQuery)) {
      if (score < 70) {
        score = 70;
        matchType = 'keyword';
        matchReason = 'Filename contains search term';
      }
    }

    if (score >= 25) {
      scoredResults.push({
        asset,
        relevanceScore: Math.min(100, Math.round(score)),
        matchReason: matchReason || 'Matched query visual entities',
        matchType,
        highlightSnippet: highlightSnippet || undefined,
      });
    }
  }

  return sortResults(scoredResults, filter.sortBy || 'relevance');
}

function sortResults(results: SearchResult[], sortBy?: string): SearchResult[] {
  if (sortBy === 'newest') {
    return [...results].sort(
      (a, b) => new Date(b.asset.createdAt).getTime() - new Date(a.asset.createdAt).getTime()
    );
  }
  if (sortBy === 'oldest') {
    return [...results].sort(
      (a, b) => new Date(a.asset.createdAt).getTime() - new Date(b.asset.createdAt).getTime()
    );
  }
  return [...results].sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return new Date(b.asset.createdAt).getTime() - new Date(a.asset.createdAt).getTime();
  });
}

export function findSimilarAssets(target: VisualAsset, allAssets: VisualAsset[]): SearchResult[] {
  const others = allAssets.filter((a) => a.id !== target.id);
  const results: SearchResult[] = [];

  for (const candidate of others) {
    let score = 0;
    let reason = '';
    let matchType: SearchResult['matchType'] = 'tag';

    const targetPool = `${target.description} ${(target.tags || []).join(' ')}`.toLowerCase();
    const candidatePool = `${candidate.description} ${(candidate.tags || []).join(' ')}`.toLowerCase();

    // Shared visual tags
    const sharedTags = (target.tags || []).filter((t) => (candidate.tags || []).includes(t));
    if (sharedTags.length > 0) {
      score += sharedTags.length * 20;
      reason = `Shared visual entities: ${sharedTags.join(', ')}`;
    }

    // Same visual category
    if (candidate.category === target.category) {
      score += 25;
      if (!reason) reason = `Same visual classification (${target.category})`;
    }

    // Description word overlap
    const targetWords = targetPool.split(/\s+/).filter((w) => w.length > 4);
    const sharedWords = targetWords.filter((w) => candidatePool.includes(w));
    if (sharedWords.length > 2) {
      score += Math.min(30, sharedWords.length * 5);
      matchType = 'semantic';
      reason = `Correlated visual scene context (${sharedWords.slice(0, 3).join(', ')})`;
    }

    if (score >= 25) {
      results.push({
        asset: candidate,
        relevanceScore: Math.min(100, Math.round(score)),
        matchReason: reason,
        matchType,
      });
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 8);
}
