import React, { useCallback, useState, useEffect } from 'react';
import PaymentCalculation from './PaymentCalculation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw } from "lucide-react";
import WeekExportButton from './WeekExportButton';

const WeekSchedule = ({ weekData, weekIndex, onUpdate, onNameChange }) => {
    const [weekTitle, setWeekTitle] = useState(() => {
        const savedTitle = localStorage.getItem(`weekTitle_${weekIndex}`);
        return savedTitle || `Tydzień ${weekIndex + 1}`;
    });

    const [editingNames, setEditingNames] = useState({});

    useEffect(() => {
        localStorage.setItem(`weekTitle_${weekIndex}`, weekTitle);
    }, [weekTitle, weekIndex]);

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

    const handleDateChange = useCallback((day, value) => {
        onUpdate(weekIndex, {
            ...weekData,
            dates: {
                ...weekData.dates,
                [day]: value
            }
        });
    }, [weekData, weekIndex, onUpdate]);

    const handleResetSchedule = useCallback((person) => {
        const isLeader = weekData.schedule[person].isLeader;
        const resetSchedule = Object.fromEntries(
            Object.keys(weekData.dates).map(day => [
                day,
                { type: 'time', start: '', end: '' }
            ])
        );
    
        onUpdate(weekIndex, {
            ...weekData,
            schedule: {
                ...weekData.schedule,
                [person]: {
                    ...resetSchedule,
                    isLeader: isLeader
                }
            }
        });
    }, [weekData, weekIndex, onUpdate]);

    const renderScheduleCell = (person, day, shift) => {
        return (
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
        );
    };

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    className="text-xl font-bold mb-4 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:outline-none px-1"
                    value={weekTitle}
                    onChange={(e) => setWeekTitle(e.target.value)}
                />
                <WeekExportButton weekData={weekData} weekIndex={weekIndex} />
            </div>

            <div id={`week-container-${weekIndex}`} className="pdf-content">
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
                                <th className="border p-2 w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(weekData.schedule).map(([person, shifts]) => {
                                const isLeader = shifts.isLeader;
                                return (
                                    <tr key={person}>
                                        <td className="border p-2">
                                            <input
                                                type="text"
                                                className="font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:outline-none px-1 w-full"
                                                value={editingNames[person] ?? person}
                                                onChange={(e) => setEditingNames({
                                                    ...editingNames,
                                                    [person]: e.target.value
                                                })}
                                                onBlur={() => {
                                                    const newName = editingNames[person]?.trim();
                                                    if (newName && newName !== person) {
                                                        onNameChange(person, newName);
                                                    }
                                                    setEditingNames(prev => {
                                                        const newState = { ...prev };
                                                        delete newState[person];
                                                        return newState;
                                                    });
                                                }}
                                                onFocus={() => setEditingNames(prev => ({
                                                    ...prev,
                                                    [person]: person
                                                }))}
                                            />
                                        </td>
                                        {Object.entries(weekData.dates).map(([day]) => 
                                            renderScheduleCell(person, day, shifts[day])
                                        )}
                                        <td className="border p-2">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button 
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                                        title="Resetuj grafik"
                                                    >
                                                        <RotateCcw className="h-5 w-5" />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            {isLeader ? 'Resetować grafik lidera?' : 'Resetować grafik?'}
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Czy na pewno chcesz zresetować grafik dla {person} w {weekTitle}? 
                                                            Ta akcja usunie wszystkie godziny pracy.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleResetSchedule(person)}
                                                            className="bg-blue-500 hover:bg-blue-600"
                                                        >
                                                            Resetuj
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mb-4 flex gap-4">
                    <div className="flex items-center">
                        <span className="mr-2">Oznaczenie stawek:</span>
                        {Object.entries(weekData.labels).map(([key, label]) => (
                            <input
                                key={key}
                                type="text"
                                className="w-16 text-sm border rounded px-2 py-1 mx-1"
                                value={label}
                                onChange={(e) => {
                                    onUpdate(weekIndex, {
                                        ...weekData,
                                        labels: {
                                            ...weekData.labels,
                                            [key]: e.target.value
                                        }
                                    });
                                }}
                                placeholder={key}
                            />
                        ))}
                    </div>
                </div>
                
                <PaymentCalculation
                    weekData={weekData}
                    onRateChange={(person, rateType, value) => {
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
                    }}
                    onBonusChange={(person, newBonus) => {
                        onUpdate(weekIndex, {
                            ...weekData,
                            bonuses: {
                                ...weekData.bonuses,
                                [person]: newBonus
                            }
                        });
                    }}
                />
            </div>
        </div>
    );
};

export default WeekSchedule;