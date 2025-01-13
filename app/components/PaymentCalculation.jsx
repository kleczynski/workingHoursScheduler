import React from 'react';

const PaymentCalculation = ({ weekData, onRateChange, onBonusChange }) => {
    const calculatePayment = (person) => {
        if (person === 'Leader') return null;

        let totalHours = 0;
        let soloHours = 0;
        let saturdayHours = 0;
        
        Object.entries(weekData.schedule[person]).forEach(([day, shift]) => {
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
                    .filter(([otherPerson]) => otherPerson !== person && otherPerson !== 'Leader')
                    .every(([_, days]) => {
                        const otherShift = days[day];
                        if (otherShift.type === 'wolne') return true;
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

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">WYPŁATA</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2">Osoba</th>
                            <th className="border p-2">Stawki ({weekData.labels.A}/{weekData.labels.B}/{weekData.labels.C})</th>
                            <th className="border p-2">Czas pracy</th>
                            <th className="border p-2">Dodatek funkcyjny</th>
                            <th className="border p-2">Wypłata</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(weekData.schedule)
                            .filter(([person]) => person !== 'Leader')
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
                                            <div>Całkowity: {calculation.hours.total.toFixed(2)}h</div>
                                            <div>Samodzielny: {calculation.hours.solo.toFixed(2)}h</div>
                                            <div>Sobota: {calculation.hours.saturday.toFixed(2)}h</div>
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
                                    </tr>
                                );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentCalculation;