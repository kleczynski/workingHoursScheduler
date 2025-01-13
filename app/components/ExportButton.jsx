import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ExportButton = ({ mainHeader }) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const scheduleElement = document.getElementById('schedule-container');
            if (!scheduleElement) return;

            // Create canvas with higher quality settings
            const canvas = await html2canvas(scheduleElement, {
                scale: 3, // Increase scale for better quality
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: scheduleElement.scrollWidth,
                windowHeight: scheduleElement.scrollHeight,
                onclone: (clonedDoc) => {
                    // Adjust clone for better rendering
                    const element = clonedDoc.getElementById('schedule-container');
                    if (element) {
                        element.style.padding = '30px';
                        // Make all text black for better contrast
                        element.style.color = '#000000';
                        // Ensure proper width
                        element.style.width = 'auto';
                        element.style.maxWidth = 'none';
                    }
                }
            });

            // Create PDF in landscape with larger format
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a3' // Use A3 for more space
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Calculate dimensions to fit content properly
            const imgWidth = pageWidth - 20; // 10mm margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Split content into pages if needed
            let heightLeft = imgHeight;
            let position = 0;
            let page = 1;

            // Add first page
            pdf.addImage(
                canvas.toDataURL('image/jpeg', 1.0),
                'JPEG',
                10, // x
                10, // y
                imgWidth,
                imgHeight,
                undefined,
                'FAST',
                0
            );

            // Add more pages if content overflows
            while (heightLeft >= pageHeight) {
                position = heightLeft - pageHeight;
                pdf.addPage();
                pdf.addImage(
                    canvas.toDataURL('image/jpeg', 1.0),
                    'JPEG',
                    10,
                    -(pageHeight * page) + 10,
                    imgWidth,
                    imgHeight,
                    undefined,
                    'FAST',
                    0
                );
                heightLeft -= pageHeight;
                page++;
            }

            // Save with formatted date
            const date = new Date().toISOString().split('T')[0];
            pdf.save(`${mainHeader || 'grafik-pracy'}-${date}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            className="flex items-center gap-2"
            variant="outline"
            disabled={isExporting}
        >
            <Download className="h-4 w-4" />
            {isExporting ? 'Generowanie PDF...' : 'Eksportuj do PDF'}
        </Button>
    );
};

export default ExportButton;