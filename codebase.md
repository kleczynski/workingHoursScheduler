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

# app/components/AuthWrapper.jsx

```jsx
import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';

const AuthWrapper = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = localStorage.getItem('isAuthenticated');
        setIsAuthenticated(auth === 'true');
        setIsLoading(false);
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div>
            {children}
        </div>
    );
};

export default AuthWrapper;
```

# app/components/ExportButton.jsx

```jsx
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ExportButton = ({ mainHeader }) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const scheduleElement = document.getElementById('schedule-container');
            if (!scheduleElement) return;

            // Create canvas with higher quality settings
            const canvas = await html2canvas(scheduleElement, {
                scale: 3, // Increase scale for better quality
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: scheduleElement.scrollWidth,
                windowHeight: scheduleElement.scrollHeight,
                onclone: (clonedDoc) => {
                    // Adjust clone for better rendering
                    const element = clonedDoc.getElementById('schedule-container');
                    if (element) {
                        element.style.padding = '30px';
                        // Make all text black for better contrast
                        element.style.color = '#000000';
                        // Ensure proper width
                        element.style.width = 'auto';
                        element.style.maxWidth = 'none';
                    }
                }
            });

            // Create PDF in landscape with larger format
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a3' // Use A3 for more space
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Calculate dimensions to fit content properly
            const imgWidth = pageWidth - 20; // 10mm margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Split content into pages if needed
            let heightLeft = imgHeight;
            let position = 0;
            let page = 1;

            // Add first page
            pdf.addImage(
                canvas.toDataURL('image/jpeg', 1.0),
                'JPEG',
                10, // x
                10, // y
                imgWidth,
                imgHeight,
                undefined,
                'FAST',
                0
            );

            // Add more pages if content overflows
            while (heightLeft >= pageHeight) {
                position = heightLeft - pageHeight;
                pdf.addPage();
                pdf.addImage(
                    canvas.toDataURL('image/jpeg', 1.0),
                    'JPEG',
                    10,
                    -(pageHeight * page) + 10,
                    imgWidth,
                    imgHeight,
                    undefined,
                    'FAST',
                    0
                );
                heightLeft -= pageHeight;
                page++;
            }

            // Save with formatted date
            const date = new Date().toISOString().split('T')[0];
            pdf.save(`${mainHeader || 'grafik-pracy'}-${date}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            className="flex items-center gap-2"
            variant="outline"
            disabled={isExporting}
        >
            <Download className="h-4 w-4" />
            {isExporting ? 'Generowanie PDF...' : 'Eksportuj do PDF'}
        </Button>
    );
};

export default ExportButton;
```

# app/components/LoginPage.jsx

```jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === 'papaj300') {
            localStorage.setItem('isAuthenticated', 'true');
            onLogin();
            setError('');
        } else {
            setError('Nieprawidłowe hasło');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Grafik Pracy - Logowanie
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Wprowadź hasło"
                                autoComplete="current-password"
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full">
                            Zaloguj
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
```

# app/components/PaymentCalculation.jsx

```jsx
import React from 'react';

const PaymentCalculation = ({ weekData, onRateChange, onBonusChange }) => {
    const calculatePayment = (person) => {
        if (weekData.schedule[person].isLeader) return null;
        if (!weekData.rates[person]) return null;

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
                            .filter(([person]) => !weekData.schedule[person].isLeader)
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
```

# app/components/ScheduleContainer.jsx

```jsx
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import WeekSchedule from './WeekSchedule';
import { defaultWeekConfig, createNewStaffMember } from '../config/defaultConfig';
import ExportButton from './ExportButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button';

const NUMBER_OF_WEEKS = 5;

const ScheduleContainer = () => {
    const [weeks, setWeeks] = useState(() => 
        Array(NUMBER_OF_WEEKS).fill(null).map(() => JSON.parse(JSON.stringify(defaultWeekConfig)))
    );
    const [isClient, setIsClient] = useState(false);
    const [mainHeader, setMainHeader] = useState("Grafik Pracy");
    const [hasLeader, setHasLeader] = useState(true); // Add state for leader presence

    const handleAddStaffMember = useCallback((isLeader = false) => {
        const title = isLeader ? 'Wprowadź imię nowego lidera:' : 'Wprowadź imię nowej osoby:';
        const name = prompt(title);
        if (!name) return;
    
        setWeeks(prev => prev.map(week => {
            // Check if we already have a leader when trying to add one
            if (isLeader && Object.values(week.schedule).some(person => 
                typeof person === 'object' && person.isLeader
            )) {
                alert('Może być tylko jeden lider w grafiku!');
                return week;
            }
    
            // If adding a leader, first remove existing leader if any
            const newSchedule = { ...week.schedule };
            if (isLeader) {
                Object.keys(newSchedule).forEach(key => {
                    if (newSchedule[key].isLeader) {
                        delete newSchedule[key];
                    }
                });
            }
    
            return {
                ...week,
                schedule: {
                    ...newSchedule,
                    [name]: {
                        name,
                        isLeader,
                        Pon: { type: 'time', start: '', end: '' },
                        Wt: { type: 'time', start: '', end: '' },
                        Śr: { type: 'time', start: '', end: '' },
                        Czw: { type: 'time', start: '', end: '' },
                        Pt: { type: 'time', start: '', end: '' },
                        Sob: { type: 'time', start: '', end: '' },
                    }
                },
                ...(!isLeader && {
                    rates: {
                        ...week.rates,
                        [name]: { A: 25, B: 7, C: 2 }
                    },
                    bonuses: {
                        ...week.bonuses,
                        [name]: { enabled: false, description: '', amount: 0 }
                    }
                })
            };
        }));
    }, []);

    const handleRemoveLeader = useCallback(() => {
        setWeeks(prev => prev.map(week => {
            const newSchedule = { ...week.schedule };
            Object.keys(newSchedule).forEach(personName => {
                if (newSchedule[personName].isLeader) {
                    delete newSchedule[personName];
                }
            });
            return { ...week, schedule: newSchedule };
        }));
    }, []);


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
        if (!newName || oldName === newName) return;
        
        // Validate that the new name doesn't already exist
        if (weeks[0].schedule.hasOwnProperty(newName)) {
            alert('Pracownik o takim imieniu już istnieje!');
            return;
        }
        
        setWeeks(prev => prev.map(week => {
            const newSchedule = {};
            const newRates = { ...week.rates };
            const newBonuses = { ...week.bonuses };
                
            // Copy all data, replacing the old name with the new one
            Object.entries(week.schedule).forEach(([name, value]) => {
                if (name === oldName) {
                    newSchedule[newName] = {
                        ...value,
                        name: newName, // Update the name in the schedule object
                        isLeader: value.isLeader || name === 'Leader'  // Ensure isLeader is true if it was the Leader
                    };
                } else {
                    newSchedule[name] = value;
                }
            });
            
            // Update rates and bonuses if the renamed person is not the leader
            if (oldName in week.rates) {
                newRates[newName] = week.rates[oldName];
                delete newRates[oldName];
            }
            if (oldName in week.bonuses) {
                newBonuses[newName] = week.bonuses[oldName];
                delete newBonuses[oldName];
            }
            
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
        setWeeks(prev => prev.map(week => {
            const newSchedule = { ...week.schedule };
            const newRates = { ...week.rates };
            const newBonuses = { ...week.bonuses };
            delete newSchedule[personName];
            // Only delete rates and bonuses for non-leader staff
            if (!newSchedule[personName]?.isLeader) {
                delete newRates[personName];
                delete newBonuses[personName];
            }
            return {
                ...week,
                schedule: newSchedule,
                rates: newRates,
                bonuses: newBonuses
            };
        }));
    }, []);

    const handleToggleLeader = useCallback(() => {
        setHasLeader(prevHasLeader => !prevHasLeader);
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
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleAddStaffMember(false)}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        Dodaj Pracownika
                    </Button>
                    <Button
                        onClick={handleToggleLeader} // Toggle leader presence
                        className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                        {hasLeader ? 'Usuń Lidera' : 'Dodaj Lidera'} {/* Dynamic button text */}
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Lista Pracowników</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(weeks[0].schedule).map(([personId, person]) => (
                        <div key={personId} 
                             className={`flex items-center justify-between p-3 bg-white rounded-lg shadow ${
                                 person.isLeader ? 'border-2 border-blue-500' : ''
                             }`}>
                            <input
                                type="text"
                                className="font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:outline-none px-1"
                                value={personId}
                                onChange={(e) => handlePersonNameChange(personId, e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                {person.isLeader && (
                                    <span className="text-sm text-blue-500">Lider</span>
                                )}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                {person.isLeader ? 'Usunąć lidera?' : 'Usunąć pracownika?'}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Czy na pewno chcesz usunąć {personId}? Ta akcja jest nieodwracalna.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeletePerson(personId)}
                                                className="bg-red-500 hover:bg-red-600"
                                            >
                                                Usuń
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {weeks.map((weekData, index) => (
                <WeekSchedule
                    key={index}
                    weekData={{
                        ...weekData,
                        schedule: {
                            ...weekData.schedule,
                            ...(hasLeader && { Leader: createNewStaffMember('Leader', true) }) // Conditionally add leader
                        }
                    }}
                    weekIndex={index}
                    onUpdate={handleWeekUpdate}
                    onNameChange={handlePersonNameChange}
                />
            ))}
        </div>
    );
};

export default ScheduleContainer;
```

# app/components/WeekExportButton.jsx

```jsx
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

```

# app/components/WeekSchedule.jsx

```jsx
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

    const handleLabelChange = useCallback((rateType, newLabel) => {
        onUpdate(weekIndex, {
            ...weekData,
            labels: {
                ...weekData.labels,
                [rateType]: newLabel
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
                    isLeader: isLeader // Preserve leader status
                }
            },
            ...(!isLeader && {
                bonuses: {
                    ...weekData.bonuses,
                    [person]: { enabled: false, description: '', amount: 0 }
                }
            })
        });
    }, [weekData, weekIndex, onUpdate]);

    const handleNameInputChange = (person, value) => {
        setEditingNames(prev => ({
            ...prev,
            [person]: value
        }));
    };

    const handleNameInputBlur = (oldName) => {
        const newName = editingNames[oldName]?.trim();
        if (newName && newName !== oldName) {
            onUpdate(weekIndex, {
                ...weekData,
                schedule: {
                    ...weekData.schedule,
                    [newName]: weekData.schedule[oldName] // Copy the old data to the new name
                }
            });

            onNameChange(oldName, newName);
        }
        // Reset the editing state for this name
        setEditingNames(prev => {
            const newState = { ...prev };
            delete newState[oldName];
            return newState;
        });
    };

    const handleNameInputFocus = (person) => {
        setEditingNames(prev => ({
            ...prev,
            [person]: person
        }));
    };

    const renderScheduleCell = (person, day, shift) => {
        const isLeader = weekData.schedule[person].isLeader;
        
        return (
            <td key={day} className="border p-2">
                <div className="flex flex-col gap-1">
                    <select
                        className="border p-1"
                        value={shift.type}
                        onChange={() => handleTypeToggle(person, day)}
                    >
                        <option value="time">Godziny</option>
                        <option value="wolne">WOLNE</option> {/* This line was previously only for non-leaders */}
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
                            {/* Add empty header cell for the reset button column */}
                            <th className="border p-2 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                    {Object.entries(weekData.schedule).map(([person, days]) => {
                        const isLeader = days.isLeader;
                        return (
                            <tr key={person}>
                                <td className="border p-2">
                                    <input
                                        type="text"
                                        className="font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:outline-none px-1 w-full"
                                        value={editingNames[person] ?? person}
                                        onChange={(e) => handleNameInputChange(person, e.target.value)}
                                        onBlur={() => handleNameInputBlur(person)}
                                        onFocus={() => handleNameInputFocus(person)}
                                    />
                                </td>
                                {Object.entries(days)
                                    .filter(([key]) => key !== 'isLeader')
                                    .map(([day, shift]) => renderScheduleCell(person, day, shift))}
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
                                                    Ta akcja usunie wszystkie godziny pracy{!isLeader && ' i dodatki'} dla tego tygodnia.
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
                            onChange={(e) => handleLabelChange(key, e.target.value)}
                            placeholder={key}
                        />
                    ))}
                </div>
            </div>
            
            <div>
                <PaymentCalculation
                    weekData={weekData}
                    onRateChange={handleRateChange}
                    onBonusChange={handleBonusChange}
                />
            </div>
        </div>

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

# app/config/defaultConfig.js

```js
export const defaultWeekConfig = {
    labels: {
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
            isLeader: true,
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
        Ola: {
            Pon: { type: 'time', start: '10:40', end: '15:00' },
            Wt: { type: 'time', start: '8:40', end: '19:35' },
            Śr: { type: 'time', start: '10:40', end: '15:00' },
            Czw: { type: 'time', start: '10:40', end: '15:00' },
            Pt: { type: 'time', start: '10:40', end: '15:00' },
            Sob: { type: 'time', start: '', end: '' },
        },
        Grzesiek: {
            Pon: { type: 'time', start: '12:00', end: '21:45' },
            Wt: { type: 'time', start: '6:20', end: '15:25' },
            Śr: { type: 'time', start: '12:00', end: '21:45' },
            Czw: { type: 'time', start: '12:00', end: '21:45' },
            Pt: { type: 'time', start: '12:00', end: '21:45' },
            Sob: { type: 'time', start: '12:00', end: '21:45' },
        },
    }
};

export const createNewStaffMember = (name, isLeader = false) => {
    const baseSchedule = {
        isLeader,
        Pon: { type: 'time', start: '', end: '' },
        Wt: { type: 'time', start: '', end: '' },
        Śr: { type: 'time', start: '', end: '' },
        Czw: { type: 'time', start: '', end: '' },
        Pt: { type: 'time', start: '', end: '' },
        Sob: { type: 'time', start: '', end: '' },
    };

    return baseSchedule;
};
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

@media print {
    @page {
        size: A3 landscape;
        margin: 1cm;
    }

    body {
        margin: 0;
        padding: 30px;
        background: white;
        min-width: 100%;
        width: auto !important;
    }

    #schedule-container {
        background: white;
        width: 100% !important;
        max-width: none !important;
        padding: 0 !important;
    }

    table {
        page-break-inside: auto !important;
        border-collapse: collapse !important;
        width: 100% !important;
        margin-bottom: 20px !important;
    }

    tr {
        page-break-inside: avoid !important;
        page-break-after: auto !important;
    }

    th, td {
        padding: 8px !important;
        border: 1px solid #000 !important;
        font-size: 11pt !important;
        page-break-inside: avoid !important;
    }

    input, select {
        border: none !important;
        font-size: 11pt !important;
        padding: 0 !important;
        margin: 0 !important;
    }
}
```

# app/hooks/usePdfExport.js

```js
// First, let's create a specialized hook for PDF generation
import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// First, let's create an enhanced version of the usePdfExport hook
const usePdfExport = (weekData, weekIndex) => {
    const [isExporting, setIsExporting] = useState(false);

    const generatePdf = useCallback(async () => {
        try {
            setIsExporting(true);

            // Initialize PDF with A4 landscape for better horizontal space utilization
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Capture the entire week container as a single unified element
            const weekContainer = document.getElementById(`week-container-${weekIndex}`);
            
            if (!weekContainer) {
                throw new Error('Week container element not found');
            }

            // Apply temporary styling for optimal capture
            const originalStyle = weekContainer.style.cssText;
            weekContainer.style.cssText = `
                background: white;
                padding: 20px;
                max-width: none;
                width: auto;
            `;

            // Generate high-quality canvas
            const canvas = await html2canvas(weekContainer, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: weekContainer.scrollWidth,
                windowHeight: weekContainer.scrollHeight,
                onclone: (clonedDoc) => {
                    // Optimize cloned content for PDF
                    const clonedElement = clonedDoc.getElementById(`week-container-${weekIndex}`);
                    if (clonedElement) {
                        // Ensure all text is black for better contrast
                        clonedElement.querySelectorAll('*').forEach(el => {
                            el.style.color = '#000000';
                        });
                        // Optimize table layouts
                        clonedElement.querySelectorAll('table').forEach(table => {
                            table.style.width = '100%';
                            table.style.borderCollapse = 'collapse';
                        });
                    }
                }
            });

            // Restore original styling
            weekContainer.style.cssText = originalStyle;

            // Calculate optimal dimensions for fitting content on one page
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10; // 10mm margins

            // Calculate aspect ratio and dimensions
            const contentWidth = pageWidth - (2 * margin);
            const contentHeight = (canvas.height * contentWidth) / canvas.width;

            // If content height exceeds page height, scale down proportionally
            const scaleFactor = Math.min(1, (pageHeight - (2 * margin)) / contentHeight);
            const finalWidth = contentWidth * scaleFactor;
            const finalHeight = contentHeight * scaleFactor;

            // Center content on page
            const xPosition = margin + (contentWidth - finalWidth) / 2;
            const yPosition = margin + (pageHeight - finalHeight) / 2;

            // Add image to PDF
            doc.addImage(
                canvas.toDataURL('image/jpeg', 1.0),
                'JPEG',
                xPosition,
                yPosition,
                finalWidth,
                finalHeight,
                undefined,
                'FAST',
                0
            );

            // Save with formatted date
            const date = new Date().toISOString().split('T')[0];
            doc.save(`tydzien-${weekIndex + 1}-${date}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
        } finally {
            setIsExporting(false);
        }
    }, [weekData, weekIndex]);

    return { isExporting, generatePdf };
};

export default usePdfExport;
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
'use client';

import React from 'react';
import ScheduleContainer from './components/ScheduleContainer';
import AuthWrapper from './components/AuthWrapper';

export default function Home() {
  return (
    <AuthWrapper>
      <ScheduleContainer />
    </AuthWrapper>
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

# components/ui/alert-dialog.tsx

```tsx
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

```

# components/ui/button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

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
    "@radix-ui/react-alert-dialog": "^1.1.4",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.2",
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
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "app/hooks/usePdfExport.js"],
  "exclude": ["node_modules"]
}

```

