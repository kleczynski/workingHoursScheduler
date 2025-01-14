import React, { useState, useEffect, useCallback } from 'react';
import WeekSchedule from './WeekSchedule';
import { defaultWeekConfig } from '../config/defaultConfig';
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
    const [hasLeader, setHasLeader] = useState(true);

    const handleAddStaffMember = useCallback((isLeader = false) => {
        const title = isLeader ? 'Wprowadź imię nowego lidera:' : 'Wprowadź imię nowej osoby:';
        const name = prompt(title);
        if (!name) return;
    
        setWeeks(prev => prev.map(week => {
            const newSchedule = { ...week.schedule };
            
            // If adding a leader, remove the existing leader first
            if (isLeader) {
                Object.entries(newSchedule).forEach(([key, value]) => {
                    if (value.isLeader) {
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

        if (isLeader) {
            setHasLeader(true);
        }
    }, []);

    const handleToggleLeader = useCallback(() => {
        setWeeks(prev => prev.map(week => {
            const newSchedule = { ...week.schedule };
            
            // Remove existing leader if any
            Object.entries(newSchedule).forEach(([key, value]) => {
                if (value.isLeader) {
                    delete newSchedule[key];
                }
            });

            return {
                ...week,
                schedule: newSchedule
            };
        }));
        
        setHasLeader(false);
    }, []);

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem('scheduleData');
        const savedHeader = localStorage.getItem('mainHeader');
        if (saved) {
            try {
                const parsedData = JSON.parse(saved);
                setWeeks(parsedData);
                
                // Check if there's a leader in the schedule
                const hasLeaderInSchedule = Object.values(parsedData[0].schedule).some(
                    person => person.isLeader
                );
                setHasLeader(hasLeaderInSchedule);
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
            localStorage.setItem('scheduleData', JSON.stringify(weeks));
            localStorage.setItem('mainHeader', mainHeader);
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
                        name: newName
                    };
                } else {
                    newSchedule[name] = value;
                }
            });
            
            // Update rates and bonuses if the renamed person is not a leader
            if (!week.schedule[oldName].isLeader) {
                if (oldName in week.rates) {
                    newRates[newName] = week.rates[oldName];
                    delete newRates[oldName];
                }
                if (oldName in week.bonuses) {
                    newBonuses[newName] = week.bonuses[oldName];
                    delete newBonuses[oldName];
                }
            }
            
            return {
                ...week,
                schedule: newSchedule,
                rates: newRates,
                bonuses: newBonuses
            };
        }));
    }, [weeks]);

    const handleDeletePerson = useCallback((personName) => {
        setWeeks(prev => prev.map(week => {
            const newSchedule = { ...week.schedule };
            const newRates = { ...week.rates };
            const newBonuses = { ...week.bonuses };
            
            const isLeader = newSchedule[personName]?.isLeader;
            delete newSchedule[personName];
            
            if (!isLeader) {
                delete newRates[personName];
                delete newBonuses[personName];
            }
            
            if (isLeader) {
                setHasLeader(false);
            }
            
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
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleAddStaffMember(false)}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        Dodaj Pracownika
                    </Button>
                    {!hasLeader ? (
                        <Button
                            onClick={() => handleAddStaffMember(true)}
                            className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                            Dodaj Lidera
                        </Button>
                    ) : (
                        <Button
                            onClick={handleToggleLeader}
                            className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                            Usuń Lidera
                        </Button>
                    )}
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