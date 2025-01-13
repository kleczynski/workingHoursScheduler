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