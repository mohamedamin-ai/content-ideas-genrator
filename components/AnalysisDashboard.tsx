import React from 'react';
import { AnalysisResult, KeywordData, ContentTopic } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, TrendingUp, Users, FileText, Activity, Download } from 'lucide-react';

interface Props {
  data: AnalysisResult;
}

const AnalysisDashboard: React.FC<Props> = ({ data }) => {

  const downloadCSV = (content: string, fileName: string) => {
    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processField = (field: string | number | undefined | null) => {
    if (field === undefined || field === null) return '""';
    const str = String(field);
    // Escape double quotes and remove newlines for cleaner CSV cells
    return `"${str.replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ")}"`;
  };

  const exportTopics = () => {
    if (!data?.topics?.length) return;

    const headers = ['Title', 'Description', 'Primary Keyword', 'Secondary Keywords', 'Content Type', 'Projected Traffic'];
    const rows = data.topics.map(t => [
      processField(t.title),
      processField(t.description),
      processField(t.primaryKeyword),
      processField(t.secondaryKeywords?.join(', ')),
      processField(t.contentType),
      processField(t.projectedTraffic)
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csvContent, 'content-strategy-topics.csv');
  };

  const exportKeywords = () => {
    if (!data?.keywords?.length) return;

    const headers = ['Keyword', 'Volume', 'Difficulty', 'Intent', 'Relevance Score'];
    const rows = data.keywords.map(k => [
      processField(k.keyword),
      processField(k.volume),
      processField(k.difficulty),
      processField(k.intent),
      processField(k.relevanceScore.toFixed(4))
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csvContent, 'content-strategy-keywords.csv');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Executive Summary Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="text-brand-600" />
          Strategic Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-brand-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-brand-900 font-semibold">
              <Target size={18} /> Niche
            </div>
            <p className="text-slate-700 text-sm">{data.domainAnalysis.niche}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-purple-900 font-semibold">
              <Users size={18} /> Audience
            </div>
            <p className="text-slate-700 text-sm">{data.domainAnalysis.targetAudience}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-emerald-900 font-semibold">
              <TrendingUp size={18} /> Competitor Insight
            </div>
            <p className="text-slate-700 text-sm">{data.domainAnalysis.competitorInsights}</p>
          </div>
        </div>
        <p className="text-slate-600 italic border-l-4 border-brand-500 pl-4 py-2 bg-slate-50 rounded-r">
          "{data.strategicSummary}"
        </p>
      </div>

      {/* Keyword Analysis (TF-IDF & BERT Simulation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Top Keywords</h3>
            <button 
              onClick={exportKeywords}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-brand-600 border border-slate-200 hover:border-brand-200 rounded-lg px-3 py-1.5 transition-all bg-white shadow-sm hover:shadow"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
          <div className="flex-grow min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.keywords.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="keyword" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="volume" name="Search Volume" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Semantic Relevance (TF-IDF Score)</h3>
           <div className="overflow-y-auto max-h-64 pr-2 space-y-3 flex-grow custom-scrollbar">
             {data.keywords.map((kw, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                 <div>
                   <p className="font-medium text-slate-800 text-sm">{kw.keyword}</p>
                   <span className={`text-xs px-2 py-0.5 rounded-full ${
                     kw.intent === 'Commercial' ? 'bg-amber-100 text-amber-800' :
                     kw.intent === 'Informational' ? 'bg-blue-100 text-blue-800' :
                     'bg-gray-100 text-gray-800'
                   }`}>
                     {kw.intent}
                   </span>
                 </div>
                 <div className="text-right">
                   <div className="text-xs text-slate-500 mb-1">Relevance</div>
                   <div className="flex items-center gap-2">
                     <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-indigo-500" 
                         style={{ width: `${kw.relevanceScore * 100}%` }}
                       />
                     </div>
                     <span className="text-xs font-bold text-indigo-700">{(kw.relevanceScore).toFixed(2)}</span>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Content Plan Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-brand-600" />
            Generated Content Plan
          </h2>
          <button 
            onClick={exportTopics}
            className="flex items-center gap-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg px-4 py-2 transition-all shadow-sm hover:shadow-md active:transform active:scale-95"
          >
            <Download size={16} />
            Export Plan
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Topic / Title</th>
                <th className="px-6 py-4">Primary Keyword</th>
                <th className="px-6 py-4">Content Type</th>
                <th className="px-6 py-4">Potential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topics.map((topic, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-medium text-slate-800 mb-1">{topic.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-2">{topic.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {topic.primaryKeyword}
                    </span>
                    <div className="mt-1 text-xs text-slate-400">
                      + {topic.secondaryKeywords.slice(0, 2).join(", ")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                      {topic.contentType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 font-medium text-emerald-600">
                       {topic.projectedTraffic}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;