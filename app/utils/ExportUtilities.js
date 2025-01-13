// ExportUtilities.js

const calculatePayment = (weekData, person) => {
    if (person === 'Leader') return null;

    let totalHours = 0;
    let soloHours = 0;
    let saturdayHours = 0;
    
    // Deeply analyze each day's schedule
    Object.entries(weekData.schedule[person]).forEach(([day, shift]) => {
        if (shift.type === 'wolne' || !shift.start || !shift.end) return;
        
        const [startHour, startMin] = shift.start.split(':').map(Number);
        const [endHour, endMin] = shift.end.split(':').map(Number);
        
        const dailyHours = ((endHour - startHour) * 60 + (endMin - startMin)) / 60;
        
        if (day === 'Sob') {
            saturdayHours = dailyHours;
        }
        
        totalHours += dailyHours;
        
        // Intricate solo hours calculation
        const currentShiftMinutes = {
            start: startHour * 60 + startMin,
            end: endHour * 60 + endMin
        };
        
        for (let minute = currentShiftMinutes.start; minute < currentShiftMinutes.end; minute++) {
            const isAlone = Object.entries(weekData.schedule)
                .filter(([otherPerson]) => otherPerson !== person && otherPerson !== 'Leader')
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .every(([_, days]) => {
                    const otherShift = days[day];
                    if (otherShift.type === 'wolne' || !otherShift.start || !otherShift.end) return true;
                    
                    const [otherStartHour, otherStartMin] = otherShift.start.split(':').map(Number);
                    const [otherEndHour, otherEndMin] = otherShift.end.split(':').map(Number);
                    
                    const otherShiftMinutes = {
                        start: otherStartHour * 60 + otherStartMin,
                        end: otherEndHour * 60 + otherEndMin
                    };
                    
                    return minute < otherShiftMinutes.start || minute >= otherShiftMinutes.end;
                });
            
            if (isAlone) soloHours += 1/60;
        }
    });

    const rates = weekData.rates[person];
    const bonus = weekData.bonuses[person];
    
    return {
        hours: { total: totalHours, solo: soloHours, saturday: saturdayHours },
        payments: {
            base: totalHours * rates.A,
            solo: soloHours * rates.B,
            saturday: saturdayHours * rates.C,
            bonus: bonus.enabled ? bonus.amount : 0,
            total: (totalHours * rates.A) + (soloHours * rates.B) + 
                  (saturdayHours * rates.C) + (bonus.enabled ? bonus.amount : 0)
        },
        rates,
        bonus
    };
};

const generateWeeklyReport = (weekData, weekIndex) => {
    const printWindow = window.open('', '_blank');
    
    const generateStyles = () => `
        body { 
            font-family: Arial, sans-serif;
            margin: 2rem;
            color: #333;
        }
        table { 
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
            background: white;
        }
        th, td { 
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
            font-size: 14px;
        }
        th { 
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .total { 
            color: #dc2626;
            font-weight: bold;
        }
        .section-header {
            margin: 2rem 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
        }
        .time-entry {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .bonus-entry {
            background-color: #f3f4f6;
            padding: 8px;
            border-radius: 4px;
            margin-top: 8px;
        }
        @media print {
            .no-print { display: none; }
            @page { size: landscape; margin: 1cm; }
            body { margin: 0; }
        }
    `;

    const generateScheduleTable = () => `
        <h2 class="section-header">GRAFIK</h2>
        <table>
            <thead>
                <tr>
                    <th>Osoba</th>
                    ${Object.entries(weekData.dates)
                        .map(([day, date]) => `
                            <th>
                                <div>${day}</div>
                                ${date ? `<div class="text-sm text-gray-600">${date}</div>` : ''}
                            </th>
                        `).join('')}
                </tr>
            </thead>
            <tbody>
                ${Object.entries(weekData.schedule)
                    .map(([person, days]) => `
                        <tr>
                            <td class="font-bold">${person}</td>
                            ${Object.entries(days)
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                .map(([_, shift]) => `
                                    <td>
                                        ${shift.type === 'wolne' 
                                            ? '<span class="font-bold">WOLNE</span>' 
                                            : `<div class="time-entry">
                                                <div>Start: ${shift.start || '-'}</div>
                                                <div>Koniec: ${shift.end || '-'}</div>
                                               </div>`
                                        }
                                    </td>
                                `).join('')}
                        </tr>
                    `).join('')}
            </tbody>
        </table>
    `;

    const generatePaymentTable = () => `
        <h2 class="section-header">WYPŁATA</h2>
        <table>
            <thead>
                <tr>
                    <th>Osoba</th>
                    <th>Czas pracy</th>
                    <th>Stawki godzinowe</th>
                    <th>Wypłata</th>
                    <th>Dodatek funkcyjny</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(weekData.schedule)
                    .filter(([person]) => person !== 'Leader')
                    .map(([person]) => {
                        const calc = calculatePayment(weekData, person);
                        if (!calc) return '';
                        
                        return `
                            <tr>
                                <td class="font-bold">${person}</td>
                                <td>
                                    <div>Całkowity: ${calc.hours.total.toFixed(2)}h</div>
                                    <div>Samodzielny: ${calc.hours.solo.toFixed(2)}h</div>
                                    <div>Sobota: ${calc.hours.saturday.toFixed(2)}h</div>
                                </td>
                                <td>
                                    <div>A: ${calc.rates.A}zł/h</div>
                                    <div>B: ${calc.rates.B}zł/h</div>
                                    <div>C: ${calc.rates.C}zł/h</div>
                                </td>
                                <td>
                                    <div>Podstawa: ${calc.payments.base.toFixed(2)}zł</div>
                                    <div>Samodzielna: ${calc.payments.solo.toFixed(2)}zł</div>
                                    <div>Sobota: ${calc.payments.saturday.toFixed(2)}zł</div>
                                    <div class="total">
                                        Suma: ${calc.payments.total.toFixed(2)}zł
                                    </div>
                                </td>
                                <td>
                                    ${calc.bonus.enabled 
                                        ? `<div class="bonus-entry">
                                            <div>${calc.bonus.description}</div>
                                            <div class="font-bold">${calc.bonus.amount.toFixed(2)}zł</div>
                                           </div>`
                                        : '-'
                                    }
                                </td>
                            </tr>
                        `;
                    }).join('')}
            </tbody>
        </table>
    `;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Grafik - Tydzień ${weekIndex + 1}</title>
            <meta charset="utf-8">
            <style>${generateStyles()}</style>
        </head>
        <body>
            <h1>Grafik Pracy - Tydzień ${weekIndex + 1}</h1>
            ${generateScheduleTable()}
            ${generatePaymentTable()}
            <div class="no-print">
                <button onclick="window.print()" style="
                    padding: 10px 20px;
                    background-color: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    Drukuj
                </button>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

// Helper function to create a downloadable PDF
const downloadAsPDF = async (weekData, weekIndex) => {
    try {
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ weekData, weekIndex }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grafik-tydzien-${weekIndex + 1}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
    }
};

export { generateWeeklyReport, downloadAsPDF, calculatePayment };