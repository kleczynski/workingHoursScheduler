import React, { useCallback } from 'react';
import PaymentCalculation from './PaymentCalculation';

const WeekSchedule = ({ weekData, weekIndex, onUpdate }) => {
    const handleTimeChange = useCallback((person, day, field, value) => {
        onUpdate(weekIndex, {
            ...weekData,
            schedule: {
                ...weekData.schedule,
                [person]: {
                    ...weekData.schedule[person],
                    [day]: {
                        ...weekData.schedule[person][day],
                        [field]: value
                    }
                }
            }
        });
    }, [weekData, weekIndex, onUpdate]);

    const handleTypeToggle = useCallback((person, day) => {
        onUpdate(weekIndex, {
            ...weekData,
            schedule: {
                ...weekData.schedule,
                [person]: {
                    ...weekData.schedule[person],
                    [day]: {
                        type: weekData.schedule[person][day].type === 'time' ? 'wolne' : 'time',
                        start: '',
                        end: ''
                    }
                }
            }
        });
    }, [weekData, weekIndex, onUpdate]);

    const handleRateChange = useCallback((person, rateType, value) => {
        onUpdate(weekIndex, {
            ...weekData,
            rates: {
                ...weekData.rates,
                [person]: {
                    ...weekData.rates[person],
                    [rateType]: value
                }
            }
        });
    }, [weekData, weekIndex, onUpdate]);

    const handleBonusChange = useCallback((person, newBonus) => {
        onUpdate(weekIndex, {
            ...weekData,
            bonuses: {
                ...weekData.bonuses,
                [person]: newBonus
            }
        });
    }, [weekData, weekIndex, onUpdate]);

    const handleDateChange = useCallback((day, value) => {
        onUpdate(weekIndex, {
            ...weekData,
            dates: {
                ...weekData.dates,
                [day]: value
            }
        });
    }, [weekData, weekIndex, onUpdate]);

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Tydzień {weekIndex + 1}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2">Osoba</th>
                            {Object.entries(weekData.dates).map(([day, date]) => (
                                <th key={day} className="border p-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="font-bold">{day}</div>
                                        <input
                                            type="date"
                                            className="border p-1 text-sm w-32"
                                            value={date || ''}
                                            onChange={(e) => handleDateChange(day, e.target.value)}
                                            placeholder="Wybierz datę"
                                        />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(weekData.schedule).map(([person, days]) => (
                            <tr key={person}>
                                <td className="border p-2 font-bold">{person}</td>
                                {Object.entries(days).map(([day, shift]) => (
                                    <td key={day} className="border p-2">
                                        <div className="flex flex-col gap-1">
                                            <select
                                                className="border p-1"
                                                value={shift.type}
                                                onChange={() => handleTypeToggle(person, day)}
                                            >
                                                <option value="time">Godziny</option>
                                                <option value="wolne">WOLNE</option>
                                            </select>
                                            {shift.type === 'time' && (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="border p-1"
                                                        value={shift.start}
                                                        onChange={(e) => handleTimeChange(person, day, 'start', e.target.value)}
                                                        placeholder="Start"
                                                    />
                                                    <input
                                                        type="text"
                                                        className="border p-1"
                                                        value={shift.end}
                                                        onChange={(e) => handleTimeChange(person, day, 'end', e.target.value)}
                                                        placeholder="Koniec"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <PaymentCalculation
                weekData={weekData}
                onRateChange={handleRateChange}
                onBonusChange={handleBonusChange}
            />
        </div>
    );
};

export default WeekSchedule;