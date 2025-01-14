// First, let's create a specialized hook for PDF generation
import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// First, let's create an enhanced version of the usePdfExport hook
const usePdfExport = (weekData, weekIndex) => {
    const [isExporting, setIsExporting] = useState(false);

    const generatePdf = useCallback(async () => {
        try {
            setIsExporting(true);

            // Initialize PDF with A4 landscape for better horizontal space utilization
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Capture the entire week container as a single unified element
            const weekContainer = document.getElementById(`week-container-${weekIndex}`);
            
            if (!weekContainer) {
                throw new Error('Week container element not found');
            }

            // Apply temporary styling for optimal capture
            const originalStyle = weekContainer.style.cssText;
            weekContainer.style.cssText = `
                background: white;
                padding: 20px;
                max-width: none;
                width: auto;
            `;

            // Generate high-quality canvas
            const canvas = await html2canvas(weekContainer, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: weekContainer.scrollWidth,
                windowHeight: weekContainer.scrollHeight,
                onclone: (clonedDoc) => {
                    // Optimize cloned content for PDF
                    const clonedElement = clonedDoc.getElementById(`week-container-${weekIndex}`);
                    if (clonedElement) {
                        // Ensure all text is black for better contrast
                        clonedElement.querySelectorAll('*').forEach(el => {
                            el.style.color = '#000000';
                        });
                        // Optimize table layouts
                        clonedElement.querySelectorAll('table').forEach(table => {
                            table.style.width = '100%';
                            table.style.borderCollapse = 'collapse';
                        });
                    }
                }
            });

            // Restore original styling
            weekContainer.style.cssText = originalStyle;

            // Calculate optimal dimensions for fitting content on one page
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10; // 10mm margins

            // Calculate aspect ratio and dimensions
            const contentWidth = pageWidth - (2 * margin);
            const contentHeight = (canvas.height * contentWidth) / canvas.width;

            // If content height exceeds page height, scale down proportionally
            const scaleFactor = Math.min(1, (pageHeight - (2 * margin)) / contentHeight);
            const finalWidth = contentWidth * scaleFactor;
            const finalHeight = contentHeight * scaleFactor;

            // Center content on page
            const xPosition = margin + (contentWidth - finalWidth) / 2;
            const yPosition = margin + (pageHeight - finalHeight) / 2;

            // Add image to PDF
            doc.addImage(
                canvas.toDataURL('image/jpeg', 1.0),
                'JPEG',
                xPosition,
                yPosition,
                finalWidth,
                finalHeight,
                undefined,
                'FAST',
                0
            );

            // Save with formatted date
            const date = new Date().toISOString().split('T')[0];
            doc.save(`tydzien-${weekIndex + 1}-${date}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
        } finally {
            setIsExporting(false);
        }
    }, [weekData, weekIndex]);

    return { isExporting, generatePdf };
};

export default usePdfExport;