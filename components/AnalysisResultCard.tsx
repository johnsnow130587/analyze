
import React, { useState } from 'react';
import { type AnalysisResult } from '../types';
import { NicheIcon } from './icons/NicheIcon';
import { SuggestionIcon } from './icons/SuggestionIcon';
import { LinkIcon } from './icons/LinkIcon';
import { SeoIcon } from './icons/SeoIcon';
import { StrategyIcon } from './icons/StrategyIcon';
import { TagIcon } from './icons/TagIcon';
import { UsersIcon } from './icons/UsersIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { FlagIcon } from './icons/FlagIcon';
import { ClockIcon } from './icons/ClockIcon';
import { DesktopMobileIcon } from './icons/DesktopMobileIcon';
import { TrafficIcon } from './icons/TrafficIcon';

interface AnalysisResultCardProps {
  result: AnalysisResult;
  index: number;
}

type Tab = 'vitals' | 'traffic' | 'strategy';

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }> = ({ active, onClick, icon, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            active
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
        }`}
    >
        {icon}
        {children}
    </button>
);

const MetricDisplay: React.FC<{ title: string; value: string | number; icon?: React.ReactNode; color?: string; children?: React.ReactNode }> = ({ title, value, icon, color = 'text-white' }) => (
    <div className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-3">
        {icon && <div className="text-indigo-400">{icon}</div>}
        <div>
            <p className="text-xs text-gray-400">{title}</p>
            <p className={`text-lg font-semibold ${color}`}>{value ?? 'N/A'}</p>
        </div>
    </div>
);

const DistributionList: React.FC<{ title: string; data: Record<string, number>; icon: React.ReactNode }> = ({ title, data, icon }) => (
    <div>
        <h4 className="flex items-center text-md font-semibold text-gray-200 mb-2">
            {icon} <span className="ml-2">{title}</span>
        </h4>
        <div className="space-y-2 text-sm">
            {Object.entries(data || {}).sort(([, a], [, b]) => b - a).map(([key, value]) => (
                <div key={key} className="flex items-center">
                    <span className="w-1/2 text-gray-400 truncate">{key}</span>
                    <div className="w-1/2 bg-gray-700 rounded-full h-2.5">
                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
                    </div>
                    <span className="ml-2 w-10 text-right text-gray-300 font-mono text-xs">{value}%</span>
                </div>
            ))}
        </div>
    </div>
);

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result, index }) => {
  const [activeTab, setActiveTab] = useState<Tab>('vitals');

  const geoDataForDisplay = (result.geographicDistribution || []).reduce((acc, item) => {
    acc[item.country] = item.percentage;
    return acc;
  }, {} as Record<string, number>);

  const renderContent = () => {
    switch (activeTab) {
        case 'traffic':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <DistributionList title="Traffic Channels" data={result.trafficChannelBreakdown} icon={<TrafficIcon className="w-5 h-5 text-amber-400"/>} />
                        <DistributionList title="Device Split" data={result.deviceSplit} icon={<DesktopMobileIcon className="w-5 h-5 text-sky-400"/>} />
                        <DistributionList title="Top Countries" data={geoDataForDisplay} icon={<GlobeIcon className="w-5 h-5 text-teal-400"/>} />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h4 className="flex items-center text-md font-semibold text-gray-200 mb-2">
                                <SeoIcon className="w-5 h-5 mr-2 text-rose-400" /> SEO Authority
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <MetricDisplay title="Domain Authority" value={result.domainAuthority} />
                                <MetricDisplay title="Referring Domains" value={result.referringDomains} />
                            </div>
                        </div>
                        <div>
                           <h4 className="flex items-center text-md font-semibold text-gray-200 mb-2">
                               <TagIcon className="w-5 h-5 mr-2 text-indigo-400" /> Top Keywords
                           </h4>
                           <div className="flex flex-col gap-2">
                               {result.topKeywordsByTraffic.map((kw, i) => (
                                   <div key={i} className="bg-gray-900/50 text-sm p-2 rounded-md flex justify-between">
                                       <span className="text-gray-300">{kw.keyword}</span>
                                       <span className="text-gray-400 font-mono">{kw.traffic}</span>
                                   </div>
                               ))}
                           </div>
                        </div>
                    </div>
                </div>
            )
        case 'strategy':
             return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <h4 className="flex items-center text-md font-semibold text-gray-200 mb-2">
                           <SuggestionIcon className="w-5 h-5 mr-2 text-rose-400" /> Improvement Suggestions
                         </h4>
                         <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">
                             {result.improvementSuggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                         </ul>
                    </div>
                     <div>
                         <h4 className="flex items-center text-md font-semibold text-gray-200 mb-2">
                           <UsersIcon className="w-5 h-5 mr-2 text-indigo-400" /> Key Competitors
                         </h4>
                         <div className="space-y-3">
                            {result.keyCompetitors.map((competitor, i) => (
                                <div key={i} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                    <h5 className="font-bold text-indigo-400 text-sm">{competitor.website}</h5>
                                    <p className="text-xs text-gray-400">{competitor.niche} - <span className="font-semibold">{competitor.estimatedTraffic} traffic</span></p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             );
      case 'vitals':
      default:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricDisplay title="Global Rank" value={`#${result.globalRank?.toLocaleString()}`} icon={<GlobeIcon className="w-6 h-6"/>} />
              <MetricDisplay title="Country Rank" value={`#${result.countryRank?.toLocaleString()}`} icon={<FlagIcon className="w-6 h-6"/>} />
              <MetricDisplay title="Primary Country" value={result.country} />
              <MetricDisplay title="Monthly Visits" value={result.monthlyVisits} color="text-green-400" />
              <MetricDisplay title="Unique Visitors" value={result.uniqueVisitors} color="text-green-400"/>
              <MetricDisplay title="Page Views" value={result.pageViews} />
              <MetricDisplay title="Avg. Visit Duration" value={result.avgVisitDuration} icon={<ClockIcon className="w-6 h-6"/>} />
              <MetricDisplay title="Bounce Rate" value={result.bounceRate} color="text-amber-400" />
          </div>
        );
    }
  };

  return (
    <div id={`analysis-card-${index}`} className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white break-all">{result.website}</h2>
            <a href={`//${result.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
              Visit Site <LinkIcon className="w-4 h-4" />
            </a>
          </div>
          <div className="text-right">
              <p className="text-xs text-gray-400">Niche</p>
              <p className="text-teal-400 bg-teal-900/50 px-3 py-1 rounded-full inline-block text-sm font-semibold">{result.niche}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900/50 px-6 py-3">
          <div className="flex items-center space-x-2 border-b border-gray-700 pb-3 mb-4">
             <TabButton active={activeTab === 'vitals'} onClick={() => setActiveTab('vitals')} icon={<NicheIcon className="w-5 h-5"/>}>Vitals</TabButton>
             <TabButton active={activeTab === 'traffic'} onClick={() => setActiveTab('traffic')} icon={<TrafficIcon className="w-5 h-5"/>}>Traffic & SEO</TabButton>
             <TabButton active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} icon={<StrategyIcon className="w-5 h-5"/>}>Strategy</TabButton>
          </div>
          <div className="min-h-[200px]">
             {renderContent()}
          </div>
      </div>
    </div>
  );
};