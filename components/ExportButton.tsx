
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

export const ExportButton: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) {
            console.error("Results container not found");
            setIsExporting(false);
            return;
        }

        pdf.setFontSize(22);
        pdf.text("Website Traffic Analysis Report", pdfWidth / 2, 20, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 28, { align: 'center' });

        const cards = resultsContainer.querySelectorAll('[id^="analysis-card-"]');
        let yPos = 40;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i] as HTMLElement;
            
            // Temporarily remove hover effects for a clean capture
            const originalClasses = card.className;
            card.className = "bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden";

            const canvas = await html2canvas(card, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#1f2937' // Match the dark theme background
            });

            // Restore original classes after capture
            card.className = originalClasses;

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            const imgWidth = pdfWidth - margin * 2;
            const imgHeight = (canvasHeight * imgWidth) / canvasWidth;

            if (yPos + imgHeight > pdfHeight - margin) {
                pdf.addPage();
                yPos = margin;
            }

            // Pass the canvas element directly to addImage, avoiding the data URL conversion
            pdf.addImage(canvas, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10; // Add some padding between cards
        }

        pdf.save('website-analysis-report.pdf');
        setIsExporting(false);
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
        >
            {isExporting ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                </>
            ) : (
                <>
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    Export Results to PDF
                </>
            )}
        </button>
    );
};
