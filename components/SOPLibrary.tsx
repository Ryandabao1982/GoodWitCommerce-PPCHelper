import React, { useState, useMemo } from 'react';
import { SOP, SOPCategory } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { aiAssistSOPCreation, generateCompleteSOP, suggestSOPCategory, generateSOPTags } from '../services/sopService';

interface SOPLibraryProps {
  sops: SOP[];
  onAddSOP: (sop: Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSOP: (id: string, sop: Partial<SOP>) => void;
  onDeleteSOP: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSOPView: (id: string) => void;
  onAISearch?: (query: string) => Promise<string>;
  onAIRecommend?: () => Promise<SOP[]>;
}

const categories: SOPCategory[] = [
  'Campaign Management',
  'Keyword Research',
  'Brand Setup',
  'Performance Analysis',
  'Optimization',
  'Reporting',
  'General',
];

export const SOPLibrary: React.FC<SOPLibraryProps> = ({
  sops,
  onAddSOP,
  onUpdateSOP,
  onDeleteSOP,
  onToggleFavorite,
  onSOPView,
  onAISearch,
  onAIRecommend,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SOPCategory | 'All'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<string>('');
  const [isAISearching, setIsAISearching] = useState(false);
  const [showAIResult, setShowAIResult] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<SOP[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // AI Assistant state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState('');
  const [isAIAssisting, setIsAIAssisting] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General' as SOPCategory,
    tags: [] as string[],
    tagInput: '',
  });

  // Filter and search SOPs
  const filteredSOPs = useMemo(() => {
    return sops.filter(sop => {
      const matchesSearch = 
        sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sop.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sop.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || sop.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [sops, searchQuery, selectedCategory]);

  // Sort SOPs - favorites first, then by updated date
  const sortedSOPs = useMemo(() => {
    return [...filteredSOPs].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredSOPs]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All': sops.length };
    categories.forEach(cat => {
      counts[cat] = sops.filter(sop => sop.category === cat).length;
    });
    return counts;
  }, [sops]);

  const handleCreateSOP = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please provide both title and content');
      return;
    }

    onAddSOP({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      isFavorite: false,
      viewCount: 0,
    });

    setFormData({
      title: '',
      content: '',
      category: 'General',
      tags: [],
      tagInput: '',
    });
    setShowCreateModal(false);
  };

  const handleUpdateSOP = () => {
    if (!selectedSOP || !formData.title.trim() || !formData.content.trim()) {
      alert('Please provide both title and content');
      return;
    }

    onUpdateSOP(selectedSOP.id, {
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    });

    setIsEditing(false);
    setShowViewModal(false);
    setSelectedSOP(null);
    setFormData({
      title: '',
      content: '',
      category: 'General',
      tags: [],
      tagInput: '',
    });
  };

  const handleViewSOP = (sop: SOP) => {
    setSelectedSOP(sop);
    setShowViewModal(true);
    onSOPView(sop.id);
  };

  const handleEditSOP = (sop: SOP) => {
    setSelectedSOP(sop);
    setFormData({
      title: sop.title,
      content: sop.content,
      category: sop.category,
      tags: sop.tags,
      tagInput: '',
    });
    setIsEditing(true);
    setShowViewModal(true);
  };

  const handleAddTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleAICreateFromPrompt = async () => {
    if (!aiAssistantPrompt.trim()) return;
    
    setIsAIAssisting(true);
    try {
      const result = await generateCompleteSOP(
        formData.title || 'Untitled SOP',
        aiAssistantPrompt
      );
      
      setFormData({
        ...formData,
        content: result.content,
        category: result.category as SOPCategory,
        tags: result.tags,
      });
      
      setAiAssistantPrompt('');
      setShowAIAssistant(false);
    } catch (error) {
      alert('Failed to generate SOP. Please check your API key configuration.');
    } finally {
      setIsAIAssisting(false);
    }
  };

  const handleAIImproveContent = async () => {
    if (!formData.content.trim()) {
      alert('Please add some content first');
      return;
    }
    
    setIsAIAssisting(true);
    try {
      const improved = await aiAssistSOPCreation({
        existingContent: formData.content,
        action: 'improve',
      });
      
      setFormData({
        ...formData,
        content: improved,
      });
    } catch (error) {
      alert('Failed to improve content. Please check your API key configuration.');
    } finally {
      setIsAIAssisting(false);
    }
  };

  const handleAIFormatContent = async () => {
    if (!formData.content.trim()) {
      alert('Please add some content first');
      return;
    }
    
    setIsAIAssisting(true);
    try {
      const formatted = await aiAssistSOPCreation({
        existingContent: formData.content,
        action: 'format',
      });
      
      setFormData({
        ...formData,
        content: formatted,
      });
    } catch (error) {
      alert('Failed to format content. Please check your API key configuration.');
    } finally {
      setIsAIAssisting(false);
    }
  };

  const handleAIExpandContent = async () => {
    if (!formData.content.trim()) {
      alert('Please add some content first');
      return;
    }
    
    setIsAIAssisting(true);
    try {
      const expanded = await aiAssistSOPCreation({
        existingContent: formData.content,
        context: aiAssistantPrompt,
        action: 'expand',
      });
      
      setFormData({
        ...formData,
        content: expanded,
      });
      
      setAiAssistantPrompt('');
    } catch (error) {
      alert('Failed to expand content. Please check your API key configuration.');
    } finally {
      setIsAIAssisting(false);
    }
  };

  const handleAIAutoSuggest = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title first');
      return;
    }
    
    setIsAIAssisting(true);
    try {
      const [category, tags] = await Promise.all([
        suggestSOPCategory(formData.title, formData.content),
        generateSOPTags(formData.title, formData.content || formData.title),
      ]);
      
      setFormData({
        ...formData,
        category: category as SOPCategory,
        tags: [...new Set([...formData.tags, ...tags])], // Merge with existing tags
      });
    } catch (error) {
      alert('Failed to generate suggestions. Please check your API key configuration.');
    } finally {
      setIsAIAssisting(false);
    }
  };

  const handleAISearchClick = async () => {
    if (!onAISearch || !searchQuery.trim()) return;
    
    setIsAISearching(true);
    setShowAIResult(true);
    try {
      const result = await onAISearch(searchQuery);
      setAiSearchResult(result);
    } catch (error) {
      setAiSearchResult('AI search failed. Please try again.');
    } finally {
      setIsAISearching(false);
    }
  };

  const handleAIRecommendClick = async () => {
    if (!onAIRecommend) return;
    
    setIsAISearching(true);
    setShowRecommendations(true);
    try {
      const recommendations = await onAIRecommend();
      setAiRecommendations(recommendations);
    } catch (error) {
      setAiRecommendations([]);
    } finally {
      setIsAISearching(false);
    }
  };

  const handleExportSOPs = () => {
    const exportData = JSON.stringify(sops, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sop-library-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSOPs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSOPs = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedSOPs)) {
          importedSOPs.forEach(sop => {
            onAddSOP({
              title: sop.title,
              content: sop.content,
              category: sop.category || 'General',
              tags: sop.tags || [],
              isFavorite: false,
              viewCount: 0,
            });
          });
          alert(`Successfully imported ${importedSOPs.length} SOPs`);
        }
      } catch (error) {
        alert('Failed to import SOPs. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (sops.length === 0 && searchQuery === '' && selectedCategory === 'All') {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No SOPs Yet
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
            Create your first Standard Operating Procedure to get started. Build a comprehensive knowledge base for your team.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Create First SOP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📚 SOP Library
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                ({sops.length} {sops.length === 1 ? 'document' : 'documents'})
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Your team's knowledge base for processes, guides, and best practices
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              ➕ New SOP
            </button>
            <button
              onClick={handleExportSOPs}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              disabled={sops.length === 0}
            >
              📥 Export
            </button>
            <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
              📤 Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportSOPs}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Search and AI Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SOPs by title, content, or tags..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            </div>
            {onAISearch && (
              <button
                onClick={handleAISearchClick}
                disabled={!searchQuery.trim() || isAISearching}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAISearching ? '🔄 Searching...' : '✨ AI Search'}
              </button>
            )}
            {onAIRecommend && (
              <button
                onClick={handleAIRecommendClick}
                disabled={isAISearching}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAISearching ? '🔄 Loading...' : '🤖 AI Recommend'}
              </button>
            )}
          </div>

          {/* AI Search Result */}
          {showAIResult && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-purple-900 dark:text-purple-200">✨ AI Answer</h3>
                <button
                  onClick={() => setShowAIResult(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  ✕
                </button>
              </div>
              {isAISearching ? (
                <LoadingSpinner size="small" />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{aiSearchResult}</p>
              )}
            </div>
          )}

          {/* AI Recommendations */}
          {showRecommendations && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200">🤖 Recommended SOPs</h3>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  ✕
                </button>
              </div>
              {isAISearching ? (
                <LoadingSpinner size="small" />
              ) : aiRecommendations.length > 0 ? (
                <div className="grid gap-2">
                  {aiRecommendations.map(sop => (
                    <button
                      key={sop.id}
                      onClick={() => handleViewSOP(sop)}
                      className="text-left p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{sop.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{sop.category}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No recommendations available at this time.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {['All', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as SOPCategory | 'All')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat} ({categoryCounts[cat] || 0})
          </button>
        ))}
      </div>

      {/* SOPs Grid */}
      {sortedSOPs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No SOPs found matching your search criteria
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSOPs.map(sop => (
            <div
              key={sop.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-lg cursor-pointer group"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {sop.title}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                      {sop.category}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(sop.id);
                    }}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {sop.isFavorite ? '⭐' : '☆'}
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                  {sop.content}
                </p>

                {sop.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {sop.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {sop.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
                        +{sop.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>👁️ {sop.viewCount || 0} views</span>
                  <span>Updated {new Date(sop.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewSOP(sop)}
                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSOP(sop);
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${sop.title}"?`)) {
                        onDeleteSOP(sop.id);
                      }
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || (showViewModal && isEditing)) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full my-2 sm:my-4 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit SOP' : 'Create New SOP'}
              </h3>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* AI Assistant Panel */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <h4 className="font-bold text-purple-900 dark:text-purple-200">AI Assistant</h4>
                  </div>
                  <button
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-medium"
                  >
                    {showAIAssistant ? '▼ Hide' : '▶ Show'}
                  </button>
                </div>
                
                {showAIAssistant && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Let AI help you create, improve, or format your SOP with professional structure and formatting.
                    </p>
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleAIAutoSuggest}
                        disabled={isAIAssisting || !formData.title.trim()}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✨ Auto-Suggest Tags & Category
                      </button>
                      <button
                        onClick={handleAIFormatContent}
                        disabled={isAIAssisting || !formData.content.trim()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        📝 Format Content
                      </button>
                      <button
                        onClick={handleAIImproveContent}
                        disabled={isAIAssisting || !formData.content.trim()}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ⬆️ Improve Content
                      </button>
                      <button
                        onClick={handleAIExpandContent}
                        disabled={isAIAssisting || !formData.content.trim()}
                        className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        📈 Expand Content
                      </button>
                    </div>

                    {/* Generate from scratch */}
                    <div className="border-t border-purple-200 dark:border-purple-700 pt-3 mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Or generate complete SOP from description:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiAssistantPrompt}
                          onChange={(e) => setAiAssistantPrompt(e.target.value)}
                          placeholder="Describe what the SOP should cover..."
                          className="flex-1 px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isAIAssisting) {
                              handleAICreateFromPrompt();
                            }
                          }}
                        />
                        <button
                          onClick={handleAICreateFromPrompt}
                          disabled={isAIAssisting || !aiAssistantPrompt.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {isAIAssisting ? '🔄 Generating...' : '🚀 Generate'}
                        </button>
                      </div>
                    </div>

                    {isAIAssisting && (
                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm">
                        <LoadingSpinner size="small" />
                        <span>AI is working on your request...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., How to Launch a New Campaign"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as SOPCategory })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the SOP content, steps, guidelines, or best practices..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white font-mono text-sm resize-y min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.tagInput}
                    onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-gray-800">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowViewModal(false);
                  setIsEditing(false);
                  setSelectedSOP(null);
                  setFormData({
                    title: '',
                    content: '',
                    category: 'General',
                    tags: [],
                    tagInput: '',
                  });
                }}
                className="px-4 sm:px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isEditing ? handleUpdateSOP : handleCreateSOP}
                className="px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                {isEditing ? 'Update' : 'Create'} SOP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && !isEditing && selectedSOP && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full my-2 sm:my-4 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                    {selectedSOP.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs sm:text-sm">
                      {selectedSOP.category}
                    </span>
                    <span>👁️ {selectedSOP.viewCount || 0} views</span>
                    <span className="hidden sm:inline">Updated {new Date(selectedSOP.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedSOP(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-2xl flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {selectedSOP.content}
                </div>
              </div>

              {selectedSOP.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSOP.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-end gap-2 sm:gap-3 flex-shrink-0 bg-white dark:bg-gray-800">
              <button
                onClick={() => onToggleFavorite(selectedSOP.id)}
                className="px-4 sm:px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                {selectedSOP.isFavorite ? '⭐ Unfavorite' : '☆ Favorite'}
              </button>
              <button
                onClick={() => handleEditSOP(selectedSOP)}
                className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSOP(null);
                }}
                className="px-4 sm:px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
