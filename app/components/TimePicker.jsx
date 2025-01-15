import React from 'react';

const TimePicker = ({ value, onChange, className = '' }) => {
    // Generate time options from 5:00 to 22:30 in 15-minute intervals
    const generateTimeOptions = () => {
        const options = [];
        const startHour = 5;
        const endHour = 22;
        const endMinute = 30;

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                // Skip times after endMinute for the last hour
                if (hour === endHour && minute > endMinute) continue;

                const formattedHour = String(hour).padStart(2, '0');
                const formattedMinute = String(minute).padStart(2, '0');
                const time = `${formattedHour}:${formattedMinute}`;
                options.push(time);
            }
        }

        return options;
    };

    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`border rounded px-2 py-1 ${className}`}
        >
            <option value="">Wybierz</option>
            {generateTimeOptions().map(time => (
                <option key={time} value={time}>
                    {time}
                </option>
            ))}
        </select>
    );
};

export default TimePicker;