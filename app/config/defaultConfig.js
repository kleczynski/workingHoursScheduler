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