import usePdfExport from '../hooks/usePdfExport';
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WeekExportButton = ({ weekData, weekIndex }) => {
    const { isExporting, generatePdf } = usePdfExport(weekData, weekIndex);

    return (
        <Button
            onClick={generatePdf}
            className="flex items-center gap-2"
            variant="outline"
            disabled={isExporting}
        >
            <Download className="h-4 w-4" />
            {isExporting ? 'Generowanie PDF...' : 'Eksportuj tydzień do PDF'}
        </Button>
    );
};

export default WeekExportButton;
