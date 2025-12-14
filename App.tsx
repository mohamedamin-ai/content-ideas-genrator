import React, { useState } from 'react';
import { Sparkles, Loader2, BarChart2, Globe, Cpu, Link as LinkIcon, Calculator, Database, Settings, ChevronDown, ChevronUp, Layers, Zap, FileText } from 'lucide-react';
import { generateContentPlan } from './services/analysis';
import { AnalysisResult, AnalysisStatus } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';

const DEFAULT_URLS = `https://www.alfuttaim.com/divisions/automotive/
https://www.alfuttaim.com/divisions/financial-services/
https://www.alfuttaim.com/divisions/health/
https://www.alfuttaim.com/divisions/real-estate/
https://www.alfuttaim.com/divisions/retail/
https://www.alfuttaim.com/divisions/education-foundation/`;

function App() {
  const [urls, setUrls] = useState(DEFAULT_URLS);
  const [pageContent, setPageContent] = useState<string>("");
  const [numTopics, setNumTopics] = useState<number>(5);
  const [customIgnore, setCustomIgnore] = useState<string>("");
  const [diversityLevel, setDiversityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urls.trim()) return;

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);

    // Parse custom ignore list
    const ignoreList = customIgnore
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      const data = await generateContentPlan(urls, pageContent, numTopics, ignoreList, diversityLevel);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <BarChart2 size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Content<span className="text-indigo-600">Strategist</span> Pro
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
             <span className="flex items-center gap-1"><Sparkles size={14} className="text-amber-500"/> Gemini 2.5 Flash</span>
             <span className="flex items-center gap-1"><Globe size={14} className="text-blue-500"/> Live Grounding</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            AI-Driven Content Intelligence
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Perform deep semantic analysis on multiple URLs. We use <strong>Gemini 2.5 with Google Search Grounding</strong> to identify high-impact topics and competitor gaps in real-time.
          </p>

          <form onSubmit={handleAnalyze} className="max-w-4xl mx-auto flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-32 flex-shrink-0">
                  <label htmlFor="topic-count" className="block text-sm font-medium text-slate-700 mb-1 ml-1 text-left">Topic Count</label>
                  <input
                      id="topic-count"
                      type="number"
                      min="1"
                      max="50"
                      value={numTopics}
                      onChange={(e) => setNumTopics(Math.max(1, parseInt(e.target.value) || 0))}
                      className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all text-lg text-center h-[52px]"
                  />
              </div>

              <div className="relative flex-grow w-full">
                  <label htmlFor="url-input" className="block text-sm font-medium text-slate-700 mb-1 ml-1 text-left">Target URLs (One per line)</label>
                  <div className="relative">
                      <div className="absolute top-4 left-4 pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <textarea
                          id="url-input"
                          required
                          rows={3}
                          className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all text-sm font-mono leading-relaxed resize-y"
                          placeholder="https://example.com"
                          value={urls}
                          onChange={(e) => setUrls(e.target.value)}
                      />
                  </div>
              </div>
            </div>

            {/* Page Content Input */}
            <div className="relative w-full text-left">
              <label htmlFor="content-input" className="block text-sm font-medium text-slate-700 mb-1 ml-1">
                 Additional Context / Page Content (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-4 left-4 pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  id="content-input"
                  rows={4}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all text-sm leading-relaxed resize-y"
                  placeholder="Paste raw text, brand guidelines, or specific article content here to guide the analysis..."
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-1">
                Providing raw content helps the AI understand specific tone, details, and USPs not always visible to crawlers.
              </p>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="w-full text-left mt-2">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none"
              >
                <Settings size={16} />
                <span>Advanced Configuration</span>
                {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showSettings && (
                <div className="mt-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Custom Ignore List */}
                  <div>
                    <label htmlFor="custom-ignore" className="block text-sm font-medium text-slate-700 mb-2">
                      Custom Ignore List (Brand names, jargon)
                    </label>
                    <textarea
                      id="custom-ignore"
                      value={customIgnore}
                      onChange={(e) => setCustomIgnore(e.target.value)}
                      rows={4}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="e.g. Al Futtaim, Group, LLC"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Comma or newline separated.
                    </p>
                  </div>

                  {/* Diversity Settings */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <Layers size={16} className="text-indigo-600"/> 
                      Topic Diversity
                    </label>
                    <div className="bg-slate-50 rounded-lg p-1 flex border border-slate-200">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDiversityLevel(level)}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                            diversityLevel === level
                              ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800">
                      {diversityLevel === 'low' && (
                        <p><strong>Low Diversity:</strong> Prioritizes core business themes. Topics will be highly relevant and focused on primary offerings.</p>
                      )}
                      {diversityLevel === 'medium' && (
                        <p><strong>Medium Diversity:</strong> Balances core focus with related industry trends and adjacent topics.</p>
                      )}
                      {diversityLevel === 'high' && (
                        <p><strong>High Diversity:</strong> Maximize breadth. Explores distinct angles and wider market opportunities to avoid repetition.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex justify-end mt-2">
              <button
                  type="submit"
                  disabled={status === AnalysisStatus.ANALYZING}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-8 py-3 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md text-base"
              >
                  {status === AnalysisStatus.ANALYZING ? (
                  <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Analyzing SERP...</span>
                  </>
                  ) : (
                  <>
                      <Zap className="h-5 w-5 fill-current" />
                      <span>Generate Strategy</span>
                  </>
                  )}
              </button>
            </div>
          </form>

          {/* Technology Badges */}
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
              <Sparkles size={12} className="mr-1"/> AI Powered
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <Globe size={12} className="mr-1"/> Search Grounding
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              Semantic Analysis
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              Real-time Competitor Data
            </span>
          </div>
        </div>

        {/* Loading State Visualization */}
        {status === AnalysisStatus.ANALYZING && (
          <div className="max-w-xl mx-auto my-20">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
                </div>
              </div>
              <div className="space-y-2 text-center">
                 <p className="text-slate-800 font-medium animate-pulse">Analyzing Search Landscape...</p>
                 <p className="text-slate-500 text-sm">Identifying Competitors • Grounding Facts • Generating Strategy</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === AnalysisStatus.ERROR && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-800 my-10">
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results Dashboard */}
        {status === AnalysisStatus.SUCCESS && result && (
          <AnalysisDashboard data={result} />
        )}

      </main>
    </div>
  );
}

export default App;