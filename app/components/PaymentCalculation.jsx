import React from 'react';

const formatTimeToHoursAndMinutes = (decimalHours) => {
    // Convert total time to minutes
    const totalMinutes = Math.round(decimalHours * 60);
    
    // Calculate hours and remaining minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
        return `${minutes}min`;
    } else if (minutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${minutes}min`;
};

const PaymentCalculation = ({ weekData, onRateChange, onBonusChange }) => {
    const calculatePayment = (person) => {
        if (weekData.schedule[person].isLeader) return null;
        if (!weekData.rates[person]) return null;

        let totalHours = 0;
        let soloHours = 0;
        let saturdayHours = 0;
        
        // Define valid day keys
        const validDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
        
        // Process only valid day entries
        validDays.forEach(day => {
            const shift = weekData.schedule[person][day];
            // Skip if shift is undefined or doesn't have required properties
            if (!shift || !shift.type) return;
            
            // Skip if it's a free day or missing time data
            if (shift.type === 'wolne') return;
            if (!shift.start || !shift.end) return;
            
            const [startHour, startMin] = shift.start.split(':').map(Number);
            const [endHour, endMin] = shift.end.split(':').map(Number);
            
            const dailyHours = ((endHour - startHour) * 60 + (endMin - startMin)) / 60;
            
            if (day === 'Sob') {
                saturdayHours = dailyHours;
            }
            
            totalHours += dailyHours;
            
            const currentShiftMinutes = {
                start: startHour * 60 + startMin,
                end: endHour * 60 + endMin
            };
            
            for (let minute = currentShiftMinutes.start; minute < currentShiftMinutes.end; minute++) {
                const isAlone = Object.entries(weekData.schedule)
                    .filter(([otherPerson]) => otherPerson !== person && !weekData.schedule[otherPerson].isLeader)
                    .every(([_, schedule]) => {
                        const otherShift = schedule[day];
                        if (!otherShift || otherShift.type === 'wolne') return true;
                        if (!otherShift.start || !otherShift.end) return true;
                        
                        const [otherStartHour, otherStartMin] = otherShift.start.split(':').map(Number);
                        const [otherEndHour, otherEndMin] = otherShift.end.split(':').map(Number);
                        
                        const otherShiftMinutes = {
                            start: otherStartHour * 60 + otherStartMin,
                            end: otherEndHour * 60 + otherEndMin
                        };
                        
                        return minute < otherShiftMinutes.start || minute >= otherShiftMinutes.end;
                    });
                
                if (isAlone) {
                    soloHours += 1/60;
                }
            }
        });
        
        const rates = weekData.rates[person];
        const bonus = weekData.bonuses[person];
        
        const basePayment = totalHours * rates.A;
        const soloPayment = soloHours * rates.B;
        const saturdayPayment = saturdayHours * rates.C;
        const functionalBonus = bonus.enabled ? bonus.amount : 0;
        
        const total = basePayment + soloPayment + saturdayPayment + functionalBonus;
        
        return {
            hours: {
                total: totalHours,
                solo: soloHours,
                saturday: saturdayHours
            },
            payments: {
                base: basePayment,
                solo: soloPayment,
                saturday: saturdayPayment,
                bonus: functionalBonus,
                total: total
            },
            rates: rates,
            bonus: bonus
        };
    };

        // Calculate totals for all employees
        const calculateTotals = () => {
            const employees = Object.entries(weekData.schedule)
                .filter(([_, data]) => !data.isLeader)
                .map(([person]) => calculatePayment(person))
                .filter(calc => calc !== null);
    
            return {
                hours: {
                    total: employees.reduce((sum, emp) => sum + emp.hours.total, 0),
                    solo: employees.reduce((sum, emp) => sum + emp.hours.solo, 0),
                    saturday: employees.reduce((sum, emp) => sum + emp.hours.saturday, 0)
                },
                payments: {
                    base: employees.reduce((sum, emp) => sum + emp.payments.base, 0),
                    solo: employees.reduce((sum, emp) => sum + emp.payments.solo, 0),
                    saturday: employees.reduce((sum, emp) => sum + emp.payments.saturday, 0),
                    bonus: employees.reduce((sum, emp) => sum + emp.payments.bonus, 0),
                    total: employees.reduce((sum, emp) => sum + emp.payments.total, 0)
                }
            };
        };
    
        const totals = calculateTotals();

    const handleRateChange = (person, rateType, value) => {
        const numericValue = parseFloat(value) || 0;
        onRateChange(person, rateType, numericValue);
    };

    const handleBonusChange = (person, field, value) => {
        const currentBonus = weekData.bonuses[person];
        const newBonus = {
            ...currentBonus,
            [field]: field === 'amount' ? (parseFloat(value) || 0) : value
        };
        onBonusChange(person, newBonus);
    };

    const handleBonusToggle = (event, person) => {
        event.preventDefault();
        const currentBonus = weekData.bonuses[person];
        const newBonus = {
            ...currentBonus,
            enabled: !currentBonus.enabled
        };
        onBonusChange(person, newBonus);
    };

    const handleLabelChange = (labelType, value) => {
        const newLabels = {
            ...weekData.labels,
            [labelType]: value
        };
        onRateChange('labels', 'update', newLabels);
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">WYPŁATA</h2>
            <div className="mb-4 flex gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <span className="mr-2">Oznaczenie stawek:</span>
                        {['A', 'B', 'C'].map((key) => (
                            <input
                                key={key}
                                type="text"
                                className="w-16 text-sm border rounded px-2 py-1 mx-1"
                                value={weekData.labels[key]}
                                onChange={(e) => handleLabelChange(key, e.target.value)}
                                placeholder={key}
                            />
                        ))}
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2">Oznaczenie czasu:</span>
                        {[
                            { key: 'total', default: 'Całkowity' },
                            { key: 'solo', default: 'Samodzielny' },
                            { key: 'saturday', default: 'Sobota' }
                        ].map(({ key, default: defaultLabel }) => (
                            <input
                                key={key}
                                type="text"
                                className="w-24 text-sm border rounded px-2 py-1 mx-1"
                                value={weekData.labels[key] || defaultLabel}
                                onChange={(e) => handleLabelChange(key, e.target.value)}
                                placeholder={defaultLabel}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2">Osoba</th>
                            <th className="border p-2">Stawki ({weekData.labels.A}/{weekData.labels.B}/{weekData.labels.C})</th>
                            <th className="border p-2">Czas pracy</th>
                            <th className="border p-2">Wypłata</th>
                            <th className="border p-2">Dodatek funkcyjny</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(weekData.schedule)
                            .filter(([_, data]) => !data.isLeader)
                            .map(([person]) => {
                                const calculation = calculatePayment(person);
                                if (!calculation) return null;
    
                                return (
                                    <tr key={person}>
                                        <td className="border p-2 font-bold">{person}</td>
                                        <td className="border p-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span>{weekData.labels.A}:</span>
                                                    <input
                                                        type="number"
                                                        className="border p-1 w-20"
                                                        value={calculation.rates.A}
                                                        onChange={(e) => handleRateChange(person, 'A', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>{weekData.labels.B}:</span>
                                                    <input
                                                        type="number"
                                                        className="border p-1 w-20"
                                                        value={calculation.rates.B}
                                                        onChange={(e) => handleRateChange(person, 'B', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>{weekData.labels.C}:</span>
                                                    <input
                                                        type="number"
                                                        className="border p-1 w-20"
                                                        value={calculation.rates.C}
                                                        onChange={(e) => handleRateChange(person, 'C', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border p-2">
                                            <div>{weekData.labels.total || 'Całkowity'}: {formatTimeToHoursAndMinutes(calculation.hours.total)}</div>
                                            <div>{weekData.labels.solo || 'Samodzielny'}: {formatTimeToHoursAndMinutes(calculation.hours.solo)}</div>
                                            <div>{weekData.labels.saturday || 'Sobota'}: {formatTimeToHoursAndMinutes(calculation.hours.saturday)}</div>
                                        </td>
                                        <td className="border p-2">
                                            <div>{weekData.labels.A}: {calculation.payments.base.toFixed(2)}zł</div>
                                            <div>{weekData.labels.B}: {calculation.payments.solo.toFixed(2)}zł</div>
                                            <div>{weekData.labels.C}: {calculation.payments.saturday.toFixed(2)}zł</div>
                                            {calculation.bonus.enabled && (
                                                <div>Dodatek: {calculation.payments.bonus.toFixed(2)}zł</div>
                                            )}
                                            <div className="font-bold text-red-500 mt-2">
                                                Suma: {calculation.payments.total.toFixed(2)}zł
                                            </div>
                                        </td>
                                        <td className="border p-2">
                                            <div className="flex flex-col gap-2">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={calculation.bonus.enabled}
                                                        onChange={(e) => handleBonusToggle(e, person)}
                                                    />
                                                    <span>Aktywny</span>
                                                </label>
                                                {calculation.bonus.enabled && (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className="border p-1"
                                                            placeholder="Opis"
                                                            value={calculation.bonus.description}
                                                            onChange={(e) => handleBonusChange(person, 'description', e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            className="border p-1"
                                                            placeholder="Kwota"
                                                            value={calculation.bonus.amount}
                                                            onChange={(e) => handleBonusChange(person, 'amount', e.target.value)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        {/* Summary Row */}
                        <tr className="bg-gray-50">
                            <td colSpan={2} className="border p-2 font-bold text-right">
                                Suma całkowita:
                            </td>
                            <td className="border p-2">
                                <div>{weekData.labels.total || 'Całkowity'}: {formatTimeToHoursAndMinutes(totals.hours.total)}</div>
                                <div>{weekData.labels.solo || 'Samodzielny'}: {formatTimeToHoursAndMinutes(totals.hours.solo)}</div>
                                <div>{weekData.labels.saturday || 'Sobota'}: {formatTimeToHoursAndMinutes(totals.hours.saturday)}</div>
                            </td>
                            <td className="border p-2">
                                <div>{weekData.labels.A}: {totals.payments.base.toFixed(2)}zł</div>
                                <div>{weekData.labels.B}: {totals.payments.solo.toFixed(2)}zł</div>
                                <div>{weekData.labels.C}: {totals.payments.saturday.toFixed(2)}zł</div>
                                {totals.payments.bonus > 0 && (
                                    <div>Dodatki: {totals.payments.bonus.toFixed(2)}zł</div>
                                )}
                                <div className="font-bold text-red-500 mt-2">
                                    Suma: {totals.payments.total.toFixed(2)}zł
                                </div>
                            </td>
                            <td className="border p-2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentCalculation;
