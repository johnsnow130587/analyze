
import React from 'react';
import { type AnalysisResult } from '../types';
import { TableIcon } from './icons/TableIcon';

interface ExportCsvButtonProps {
    results: AnalysisResult[];
}

const formatCsvCell = (value: any): string => {
    if (value == null) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        const escapedValue = stringValue.replace(/"/g, '""');
        return `"${escapedValue}"`;
    }
    return stringValue;
};

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({ results }) => {
    const handleExport = () => {
        if (results.length === 0) return;

        const headers = [
            'Website', 'Niche', 'Country', 'Global Rank', 'Country Rank', 'Monthly Visits', 
            'Unique Visitors', 'Page Views', 'Bounce Rate', 'Avg Visit Duration', 
            'Domain Authority', 'Referring Domains', 'Organic Keywords', 'Top Referrers',
            'Traffic Channels (JSON)', 'Top Keywords (JSON)', 'Geographic Distribution (JSON)', 
            'Device Split (JSON)', 'Improvement Suggestions', 'Key Competitors (JSON)'
        ];

        const rows = results.map(r => [
            formatCsvCell(r.website),
            formatCsvCell(r.niche),
            formatCsvCell(r.country),
            formatCsvCell(r.globalRank),
            formatCsvCell(r.countryRank),
            formatCsvCell(r.monthlyVisits),
            formatCsvCell(r.uniqueVisitors),
            formatCsvCell(r.pageViews),
            formatCsvCell(r.bounceRate),
            formatCsvCell(r.avgVisitDuration),
            formatCsvCell(r.domainAuthority),
            formatCsvCell(r.referringDomains),
            formatCsvCell(r.organicKeywords),
            formatCsvCell(r.topReferrers.join('; ')),
            formatCsvCell(JSON.stringify(r.trafficChannelBreakdown)),
            formatCsvCell(JSON.stringify(r.topKeywordsByTraffic)),
            formatCsvCell(JSON.stringify(r.geographicDistribution)),
            formatCsvCell(JSON.stringify(r.deviceSplit)),
            formatCsvCell(r.improvementSuggestions.join('; ')),
            formatCsvCell(JSON.stringify(r.keyCompetitors))
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'website-analysis-report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
        >
            <TableIcon className="w-5 h-5" />
            Export to CSV
        </button>
    );
};
