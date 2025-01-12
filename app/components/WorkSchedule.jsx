'use client';

import React, { useState, useEffect } from 'react';

const WorkSchedule = () => {
    const initialSchedule = {
        Kasia: {
            Pon: { start: '6:20', end: '12:15' },
            Wt: { start: '16:25', end: '21:45' },
            Śr: { start: '6:20', end: '12:15' },
            Czw: { start: '6:20', end: '12:15' },
            Pt: { start: '6:20', end: '12:15' },
            Sob: { start: '6:20', end: '12:15' }
        },
        Ola: {
            Pon: { start: '10:40', end: '15:00' },
            Wt: { start: '8:40', end: '19:35' },
            Śr: { start: '10:40', end: '15:00' },
            Czw: { start: '10:40', end: '15:00' },
            Pt: { start: '10:40', end: '15:00' },
            Sob: { start: '', end: '' }
        },
        Grzesiek: {
            Pon: { start: '12:00', end: '21:45' },
            Wt: { start: '6:20', end: '15:25' },
            Śr: { start: '12:00', end: '21:45' },
            Czw: { start: '12:00', end: '21:45' },
            Pt: { start: '12:00', end: '21:45' },
            Sob: { start: '12:00', end: '21:45' }
        }
    };

    const [schedule, setSchedule] = useState(initialSchedule);
    const [calculations, setCalculations] = useState({});
    
    const calculateHours = (start, end) => {
        if (!start || !end) return 0;
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        return ((endHour - startHour) * 60 + (endMin - startMin)) / 60;
    };

    const calculatePayment = (person) => {
        let totalHours = 0;
        let soloHours = 0;
        let saturdayHours = 0;
        
        // First, let's examine each day separately
        Object.entries(schedule[person]).forEach(([day, times]) => {
            if (!times.start || !times.end) return;
            
            const currentPersonShift = {
                start: times.start,
                end: times.end
            };
            
            // Get all other people's shifts for this day
            const otherShifts = Object.entries(schedule)
                .filter(([otherPerson]) => otherPerson !== person)
                .map(([_, days]) => days[day])
                .filter(shift => shift.start && shift.end);
                
            // Calculate total hours for this day
            const dailyHours = calculateHours(times.start, times.end);
            totalHours += dailyHours;
            
            // For solo hours calculation
            const [startHour, startMin] = times.start.split(':').map(Number);
            const [endHour, endMin] = times.end.split(':').map(Number);
            
            // Convert to minutes for easier comparison
            const shiftStartMinutes = startHour * 60 + startMin;
            const shiftEndMinutes = endHour * 60 + endMin;
            
            // Initialize solo minutes counter for this day
            let dailySoloMinutes = 0;
            
            // Check each minute of the shift
            for (let currentMinute = shiftStartMinutes; currentMinute < shiftEndMinutes; currentMinute++) {
                const isAlone = otherShifts.every(otherShift => {
                    const [otherStartHour, otherStartMin] = otherShift.start.split(':').map(Number);
                    const [otherEndHour, otherEndMin] = otherShift.end.split(':').map(Number);
                    const otherStartMinutes = otherStartHour * 60 + otherStartMin;
                    const otherEndMinutes = otherEndHour * 60 + otherEndMin;
                    
                    // If current minute is outside other person's shift, they're not present
                    return currentMinute < otherStartMinutes || currentMinute >= otherEndMinutes;
                });
                
                if (isAlone) {
                    dailySoloMinutes++;
                }
            }
            
            // Convert solo minutes to hours and add to total
            soloHours += dailySoloMinutes / 60;
            
            // Saturday hours calculation
            if (day === 'Sob') {
                saturdayHours = dailyHours;
            }
        });
    
        // Calculate payment components
        const baseRate = person === 'Grzesiek' ? 28 : 25;
        const payment = {
            X: totalHours,
            Y: soloHours,
            Z: saturdayHours,
            A: totalHours * baseRate,
            B: soloHours * 7, // 7zł per hour for solo work
            C: saturdayHours * 2,
            total: (totalHours * baseRate) + (soloHours * 7) + (saturdayHours * 2)
        };
    
        return payment;
    };

    useEffect(() => {
        const newCalculations = {
            Kasia: calculatePayment('Kasia'),
            Ola: calculatePayment('Ola'),
            Grzesiek: calculatePayment('Grzesiek')
        };
        setCalculations(newCalculations);
    }, [schedule]);

    const handleTimeChange = (person, day, type, value) => {
        setSchedule(prev => ({
            ...prev,
            [person]: {
                ...prev[person],
                [day]: {
                    ...prev[person][day],
                    [type]: value
                }
            }
        }));
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-black">GRAFIK</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2 text-black">Osoba</th>
                            {Object.keys(schedule.Kasia).map(day => (
                                <th key={day} className="border p-2 text-black">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(schedule).map(([person, days]) => (
                            <tr key={person}>
                                <td className="border p-2 font-bold text-black">{person}</td>
                                {Object.entries(days).map(([day, times]) => (
                                    <td key={day} className="border p-2">
                                        <div className="flex flex-col gap-1 text-black">
                                            <input
                                                type="text"
                                                value={times.start}
                                                onChange={(e) => handleTimeChange(person, day, 'start', e.target.value)}
                                                className="border p-1 w-20 text-black"
                                                placeholder="Start"
                                            />
                                            <input
                                                type="text"
                                                value={times.end}
                                                onChange={(e) => handleTimeChange(person, day, 'end', e.target.value)}
                                                className="border p-1 w-20 text-black"
                                                placeholder="Koniec"
                                            />
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h1 className="text-2xl font-bold mt-8 mb-4 text-black">WYPŁATA</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2 text-black">Osoba</th>
                            <th className="border p-2 text-black">Czas pracy (X/Y/Z)</th>
                            <th className="border p-2 text-black">Wypłata (A/B/C)</th>
                            <th className="border p-2 text-black">Suma</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(calculations).map(([person, calc]) => (
                            <tr key={person}>
                                <td className="border p-2 font-bold text-black">{person}</td>
                                <td className="border p-2 text-black">
                                    X: {calc.X.toFixed(2)}h<br />
                                    Y: {calc.Y.toFixed(2)}h<br />
                                    Z: {calc.Z.toFixed(2)}h
                                </td>
                                <td className="border p-2 text-black">
                                    A: {calc.A.toFixed(2)}zł<br />
                                    B: {calc.B.toFixed(2)}zł<br />
                                    C: {calc.C.toFixed(2)}zł
                                </td>
                                <td className="border p-2 font-bold text-red-500">
                                    {calc.total.toFixed(2)}zł
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkSchedule;