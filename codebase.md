# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# app/components/PaymentCalculation.jsx

```jsx
import React from 'react';

const PaymentCalculation = ({ weekData, onRateChange, onBonusChange }) => {
    const calculatePayment = (person) => {
        if (person === 'Leader') return null; // Skip payment calculation for leader

        let totalHours = 0;
        let soloHours = 0;
        let saturdayHours = 0;
        
        // Calculate hours
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
            
            // Solo hours calculation
            const currentShiftMinutes = {
                start: startHour * 60 + startMin,
                end: endHour * 60 + endMin
            };
            
            // Check each minute of the shift for solo work
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
                    soloHours += 1/60; // Add one minute converted to hours
                }
            }
        });
        
        const rates = weekData.rates[person];
        const bonus = weekData.bonuses[person];
        
        // Calculate payments
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

    const handleBonusToggle = (person) => {
        onBonusChange(person, {
            ...weekData.bonuses[person],
            enabled: !weekData.bonuses[person].enabled
        });
    };

    const handleBonusUpdate = (person, field, value) => {
        onBonusChange(person, {
            ...weekData.bonuses[person],
            [field]: field === 'amount' ? (parseFloat(value) || 0) : value
        });
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">WYPŁATA</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2">Osoba</th>
                            <th className="border p-2">Stawki (A/B/C)</th>
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
                                                    <span>A:</span>
                                                    <input
                                                        type="number"
                                                        className="border p-1 w-20"
                                                        value={calculation.rates.A}
                                                        onChange={(e) => handleRateChange(person, 'A', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>B:</span>
                                                    <input
                                                        type="number"
                                                        className="border p-1 w-20"
                                                        value={calculation.rates.B}
                                                        onChange={(e) => handleRateChange(person, 'B', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>C:</span>
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
                                                        onChange={() => handleBonusToggle(person)}
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
                                                            onChange={(e) => handleBonusUpdate(person, 'description', e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            className="border p-1"
                                                            placeholder="Kwota"
                                                            value={calculation.bonus.amount}
                                                            onChange={(e) => handleBonusUpdate(person, 'amount', e.target.value)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="border p-2">
                                            <div>A: {calculation.payments.base.toFixed(2)}zł</div>
                                            <div>B: {calculation.payments.solo.toFixed(2)}zł</div>
                                            <div>C: {calculation.payments.saturday.toFixed(2)}zł</div>
                                            {calculation.bonus.enabled && (
                                                <div>D: {calculation.payments.bonus.toFixed(2)}zł</div>
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
```

# app/components/ScheduleContainer.jsx

```jsx
'use client';
import React, { useState, useEffect } from 'react';
import WeekSchedule from './WeekSchedule';

const NUMBER_OF_WEEKS = 5;

const ScheduleContainer = () => {
    const [weeks, setWeeks] = useState(() => {
        // Try to load from localStorage
        const saved = localStorage.getItem('scheduleData');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved schedule:', e);
            }
        }
        // Initialize with default data if nothing saved
        return Array(NUMBER_OF_WEEKS).fill(null).map(() => ({ ...defaultWeekConfig }));
    });

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('scheduleData', JSON.stringify(weeks));
    }, [weeks]);

    const handleWeekUpdate = (weekIndex, newData) => {
        setWeeks(prev => {
            const newWeeks = [...prev];
            newWeeks[weekIndex] = newData;
            return newWeeks;
        });
    };

    const handleAddPerson = () => {
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
    };

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
```

# app/components/WeekSchedule.jsx

```jsx
import React, { useState } from 'react';
import PaymentCalculation from './PaymentCalculation';

const defaultWeekConfig = {
    labels: {
        X: 'X',
        Y: 'Y',
        Z: 'Z',
        A: 'A',
        B: 'B',
        C: 'C',
    },
    dates: {
        Pon: '',
        Wt: '',
        Śr: '',
        Czw: '',
        Pt: '',
        Sob: '',
    },
    rates: {
        Kasia: { A: 25, B: 7, C: 2 },
        Ola: { A: 25, B: 7, C: 2 },
        Grzesiek: { A: 28, B: 7, C: 2 },
    },
    bonuses: {
        Kasia: { enabled: false, description: '', amount: 0 },
        Ola: { enabled: false, description: '', amount: 0 },
        Grzesiek: { enabled: false, description: '', amount: 0 },
    },
    schedule: {
        Leader: {
            Pon: { type: 'time', start: '', end: '' },
            Wt: { type: 'time', start: '', end: '' },
            Śr: { type: 'time', start: '', end: '' },
            Czw: { type: 'time', start: '', end: '' },
            Pt: { type: 'time', start: '', end: '' },
            Sob: { type: 'time', start: '', end: '' },
        },
        Kasia: {
            Pon: { type: 'time', start: '6:20', end: '12:15' },
            Wt: { type: 'time', start: '16:25', end: '21:45' },
            Śr: { type: 'time', start: '6:20', end: '12:15' },
            Czw: { type: 'time', start: '6:20', end: '12:15' },
            Pt: { type: 'time', start: '6:20', end: '12:15' },
            Sob: { type: 'time', start: '6:20', end: '12:15' },
        },
        // ... other employees
    }
};

const WeekSchedule = ({ weekData, weekIndex, onUpdate }) => {
    const [localData, setLocalData] = useState(weekData);
    
    const handleTimeChange = (person, day, field, value) => {
        setLocalData(prev => {
            const newData = {
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [person]: {
                        ...prev.schedule[person],
                        [day]: {
                            ...prev.schedule[person][day],
                            [field]: value
                        }
                    }
                }
            };
            onUpdate(weekIndex, newData);
            return newData;
        });
    };

    const handleTypeToggle = (person, day) => {
        setLocalData(prev => {
            const newData = {
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [person]: {
                        ...prev.schedule[person],
                        [day]: {
                            type: prev.schedule[person][day].type === 'time' ? 'wolne' : 'time',
                            start: '',
                            end: ''
                        }
                    }
                }
            };
            onUpdate(weekIndex, newData);
            return newData;
        });
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Tydzień {weekIndex + 1}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2">
                                <input 
                                    type="text"
                                    className="w-full border p-1"
                                    value={localData.labels.person || "Osoba"}
                                    onChange={(e) => handleLabelChange('person', e.target.value)}
                                />
                            </th>
                            {Object.entries(localData.dates).map(([day, date]) => (
                                <th key={day} className="border p-2">
                                    <div className="flex flex-col gap-1">
                                        <input 
                                            type="text"
                                            className="w-full border p-1"
                                            value={day}
                                            onChange={(e) => handleDayLabelChange(day, e.target.value)}
                                        />
                                        <input 
                                            type="date"
                                            className="w-full border p-1"
                                            value={date}
                                            onChange={(e) => handleDateChange(day, e.target.value)}
                                        />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(localData.schedule).map(([person, days]) => (
                            <tr key={person}>
                                <td className="border p-2 font-bold">
                                    <input 
                                        type="text"
                                        className="w-full border p-1"
                                        value={person}
                                        onChange={(e) => handlePersonNameChange(person, e.target.value)}
                                    />
                                </td>
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
                                            {shift.type === 'time' ? (
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
                                            ) : (
                                                <div className="text-center py-2">WOLNE</div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <PaymentCalculation />
            
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleDownload(weekIndex)}
            >
                Pobierz tydzień {weekIndex + 1}
            </button>
        </div>
    );
};

export default WeekSchedule;
```

# app/components/WorkSchedule.jsx

```jsx
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
```

# app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

```

# app/layout.tsx

```tsx
import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white">
        {children}
      </body>
    </html>
  );
}

```

# app/page.tsx

```tsx
import React from 'react';
import ScheduleContainer from './components/ScheduleContainer'

export default function Home() {
  return (
    <ScheduleContainer />
  );
}

```

# app/utils/ExportUtilities.js

```js
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
```

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

# components/ui/card.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

# eslint.config.mjs

```mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;

```

# lib/utils.ts

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

# next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

# package.json

```json
{
  "name": "working-hours-handler",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.471.1",
    "next": "15.1.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.1.4",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

```

# postcss.config.mjs

```mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

# README.md

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

