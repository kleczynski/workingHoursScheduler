'use client'
import React, { useState, useEffect, useCallback } from 'react';
import WeekSchedule from './WeekSchedule';
import { defaultWeekConfig } from '../config/defaultConfig';
import ExportButton from './ExportButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const NUMBER_OF_WEEKS = 5;

const ScheduleContainer = () => {
    const [weeks, setWeeks] = useState(() => 
        Array(NUMBER_OF_WEEKS).fill(null).map(() => JSON.parse(JSON.stringify(defaultWeekConfig)))
    );
    const [isClient, setIsClient] = useState(false);
    const [mainHeader, setMainHeader] = useState("Grafik Pracy");

    useEffect(() => {
        setIsClient(true);
        const saved = window.localStorage.getItem('scheduleData');
        const savedHeader = window.localStorage.getItem('mainHeader');
        if (saved) {
            try {
                const parsedData = JSON.parse(saved);
                setWeeks(parsedData);
            } catch (e) {
                console.error('Failed to parse saved schedule:', e);
            }
        }
        if (savedHeader) {
            setMainHeader(savedHeader);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            window.localStorage.setItem('scheduleData', JSON.stringify(weeks));
            window.localStorage.setItem('mainHeader', mainHeader);
        }
    }, [weeks, mainHeader, isClient]);

    const handleWeekUpdate = useCallback((weekIndex, newData) => {
        setWeeks(prev => {
            const newWeeks = [...prev];
            newWeeks[weekIndex] = newData;
            return newWeeks;
        });
    }, []);

    const handlePersonNameChange = useCallback((oldName, newName) => {
        if (!newName || oldName === 'Leader' || oldName === newName) return;
        
        // Validate that the new name doesn't already exist
        if (weeks[0].schedule.hasOwnProperty(newName)) {
            alert('Pracownik o takim imieniu już istnieje!');
            return;
        }
    
        setWeeks(prev => prev.map(week => {
            // Create new objects with the updated name
            const newSchedule = {};
            const newRates = {};
            const newBonuses = {};
    
            // Copy all data, replacing the old name with the new one
            Object.entries(week.schedule).forEach(([name, value]) => {
                newSchedule[name === oldName ? newName : name] = value;
            });
    
            Object.entries(week.rates).forEach(([name, value]) => {
                newRates[name === oldName ? newName : name] = value;
            });
    
            Object.entries(week.bonuses).forEach(([name, value]) => {
                newBonuses[name === oldName ? newName : name] = value;
            });
    
            return {
                ...week,
                schedule: newSchedule,
                rates: newRates,
                bonuses: newBonuses
            };
        }));
    }, [weeks]);

    const handleAddPerson = useCallback(() => {
        const name = prompt('Wprowadź imię nowej osoby:');
        if (!name) return;

        setWeeks(prev => prev.map(week => ({
            ...week,
            schedule: {
                ...week.schedule,
                [name]: Object.fromEntries(
                    Object.keys(week.dates).map(day => [
                        day,
                        { type: 'time', start: '', end: '' }
                    ])
                )
            },
            rates: {
                ...week.rates,
                [name]: { A: 25, B: 7, C: 2 }
            },
            bonuses: {
                ...week.bonuses,
                [name]: { enabled: false, description: '', amount: 0 }
            }
        })));
    }, []);

    const handleDeletePerson = useCallback((personName) => {
        if (personName === 'Leader') return;
        setWeeks(prev => prev.map(week => {
            const newSchedule = { ...week.schedule };
            const newRates = { ...week.rates };
            const newBonuses = { ...week.bonuses };
            delete newSchedule[personName];
            delete newRates[personName];
            delete newBonuses[personName];
            return {
                ...week,
                schedule: newSchedule,
                rates: newRates,
                bonuses: newBonuses
            };
        }));
    }, []);

    if (!isClient) {
        return <div>Loading...</div>;
    }

    return (
        <div id="schedule-container" className="p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:outline-none px-1"
                        value={mainHeader}
                        onChange={(e) => setMainHeader(e.target.value)}
                    />
                    <ExportButton mainHeader={mainHeader} />
                </div>
                <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleAddPerson}
                >
                    Dodaj Osobę
                </button>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Lista Pracowników</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(weeks[0].schedule)
                        .filter(person => person !== 'Leader')
                        .map((person) => (
                            <div key={person} className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                                <input
                                    type="text"
                                    className="font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:outline-none px-1"
                                    value={person}
                                    onChange={(e) => handlePersonNameChange(person, e.target.value)}
                                />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Usunąć pracownika?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Czy na pewno chcesz usunąć {person}? Ta akcja jest nieodwracalna.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeletePerson(person)}
                                                className="bg-red-500 hover:bg-red-600"
                                            >
                                                Usuń
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                </div>
            </div>

            {weeks.map((weekData, index) => (
                <WeekSchedule
                    key={index}
                    weekData={weekData}
                    weekIndex={index}
                    onUpdate={handleWeekUpdate}
                    onNameChange={handlePersonNameChange}
                />
            ))}
        </div>
    );
};

export default ScheduleContainer;