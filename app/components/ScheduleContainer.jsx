'use client';
import React, { useState, useEffect, useCallback } from 'react';
import WeekSchedule from './WeekSchedule';
import { defaultWeekConfig } from '../config/defaultConfig';

const NUMBER_OF_WEEKS = 5;

const ScheduleContainer = () => {
    const [weeks, setWeeks] = useState(() => 
        Array(NUMBER_OF_WEEKS).fill(null).map(() => JSON.parse(JSON.stringify(defaultWeekConfig)))
    );
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const saved = window.localStorage.getItem('scheduleData');
        if (saved) {
            try {
                const parsedData = JSON.parse(saved);
                setWeeks(parsedData);
            } catch (e) {
                console.error('Failed to parse saved schedule:', e);
            }
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            window.localStorage.setItem('scheduleData', JSON.stringify(weeks));
        }
    }, [weeks, isClient]);

    const handleWeekUpdate = useCallback((weekIndex, newData) => {
        setWeeks(prev => {
            const newWeeks = [...prev];
            newWeeks[weekIndex] = newData;
            return newWeeks;
        });
    }, []);

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

    if (!isClient) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Grafik Pracy</h1>
                <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleAddPerson}
                >
                    Dodaj Osobę
                </button>
            </div>

            {weeks.map((weekData, index) => (
                <WeekSchedule
                    key={index}
                    weekData={weekData}
                    weekIndex={index}
                    onUpdate={handleWeekUpdate}
                />
            ))}
        </div>
    );
};

export default ScheduleContainer;