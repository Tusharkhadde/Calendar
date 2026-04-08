import React, { useState, useMemo, useEffect } from 'react';

// Hardcoded Public Holidays (Approximate for 2026 for demonstration)
const HOLIDAYS = {
  '01-01': "New Year's Day",
  '01-19': "MLK Jr. Day",
  '02-14': "Valentine's Day",
  '02-16': "Presidents' Day",
  '03-17': "St. Patrick's Day",
  '04-01': "April Fools' Day",
  '05-25': "Memorial Day",
  '06-19': "Juneteenth",
  '07-04': "Independence Day",
  '09-07': "Labor Day",
  '10-31': "Halloween",
  '11-11': "Veterans Day",
  '11-26': "Thanksgiving",
  '12-25': "Christmas Day",
  '12-31': "New Year's Eve"
};

// Seasonal Theming
const SEASONS = {
  0:  { name: 'Jan', accent: '#4A6FA5', gradient: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)' },
  1:  { name: 'Feb', accent: '#5C7B9E', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
  2:  { name: 'Mar', accent: '#6BA54A', gradient: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  3:  { name: 'Apr', accent: '#38A852', gradient: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)' },
  4:  { name: 'May', accent: '#278841', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  5:  { name: 'Jun', accent: '#E88C43', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  6:  { name: 'Jul', accent: '#E76F51', gradient: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' },
  7:  { name: 'Aug', accent: '#D1712A', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
  8:  { name: 'Sep', accent: '#D97555', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  9:  { name: 'Oct', accent: '#C4573B', gradient: 'linear-gradient(135deg, #e35d5b 0%, #e53935 100%)' },
  10: { name: 'Nov', accent: '#A04030', gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
  11: { name: 'Dec', accent: '#3A5A85', gradient: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)' }
};

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Utilities
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Map Sun=0 to Sun=6, Mon=1 to Mon=0
};
const isSameDay = (d1, d2) => 
    d1 && d2 && 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate();

const formatRange = (start, end) => {
    if (!start) return "";
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    if (!end || isSameDay(start, end)) return start.toLocaleDateString('en-US', opts);
    return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
};

const getHoliday = (date) => {
    if (!date) return null;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return HOLIDAYS[`${month}-${day}`];
};

export default function App() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [rangeStart, setRangeStart] = useState(null);
    const [rangeEnd, setRangeEnd] = useState(null);
    const [hoverDate, setHoverDate] = useState(null);
    
    const [notes, setNotes] = useState([]);
    const [noteInput, setNoteInput] = useState('');
    
    // Animation states
    const [animKey, setAnimKey] = useState(0);
    const [slideDir, setSlideDir] = useState('next');

    // Load Google Fonts
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    // Calendar Data
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const theme = SEASONS[month];
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });

    const daysInMonth = getDaysInMonth(year, month);
    const startOffset = getFirstDayOfMonth(year, month);
    
    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < startOffset; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    }, [year, month, startOffset, daysInMonth]);

    // Handlers
    const handlePrevMonth = () => {
        setSlideDir('prev');
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        setAnimKey(prev => prev + 1);
    };

    const handleNextMonth = () => {
        setSlideDir('next');
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        setAnimKey(prev => prev + 1);
    };

    const handleDateClick = (date) => {
        if (!date) return;
        
        if ((rangeStart && isSameDay(date, rangeStart)) || (rangeEnd && isSameDay(date, rangeEnd))) {
            setRangeStart(null);
            setRangeEnd(null);
            return;
        }

        if (!rangeStart) {
            setRangeStart(date);
        } else if (!rangeEnd) {
            if (date < rangeStart) {
                setRangeEnd(rangeStart);
                setRangeStart(date);
            } else {
                setRangeEnd(date);
            }
        } else {
            setRangeStart(date);
            setRangeEnd(null);
        }
    };

    const handleKeyDown = (e, date) => {
        if (!date) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDateClick(date);
        }
        
        let nextDate = null;
        if (e.key === 'ArrowRight') nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        if (e.key === 'ArrowLeft') nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
        if (e.key === 'ArrowUp') nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
        if (e.key === 'ArrowDown') nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
        
        if (nextDate && nextDate.getMonth() === currentDate.getMonth()) {
            e.preventDefault();
            const el = document.getElementById(`day-cell-${nextDate.getDate()}`);
            if (el) el.focus();
        }
    };

    const handleSaveNote = () => {
        if (!noteInput.trim() || !rangeStart) return;
        const newNote = {
            id: Date.now().toString(),
            start: rangeStart,
            end: rangeEnd || rangeStart,
            text: noteInput.trim()
        };
        setNotes(prev => [...prev, newNote].sort((a, b) => a.start.getTime() - b.start.getTime()));
        setNoteInput('');
    };

    const handleDeleteNote = (id) => {
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    // Calculate effective visual range for styling
    const minEffRangeDate = rangeStart ? (rangeEnd ? Math.min(rangeStart.getTime(), rangeEnd.getTime()) : (hoverDate ? Math.min(rangeStart.getTime(), hoverDate.getTime()) : rangeStart.getTime())) : null;
    const maxEffRangeDate = rangeStart ? (rangeEnd ? Math.max(rangeStart.getTime(), rangeEnd.getTime()) : (hoverDate ? Math.max(rangeStart.getTime(), hoverDate.getTime()) : null)) : null;

    return (
        <div style={{padding: '20px'}}>
        <div className="wall-calendar-wrapper" style={{ 
            '--accent': theme.accent, 
            '--accent-light': theme.accent + '22' 
        }}>
            <style>{`
                .wall-calendar-wrapper {
                    font-family: 'DM Sans', sans-serif;
                    background-color: #FAF8F4;
                    color: #000;
                    display: flex;
                    flex-direction: column;
                    border-radius: 8px;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05);
                    max-width: 1000px;
                    margin: 40px auto;
                    position: relative;
                    overflow: hidden;
                }
                
                /* Paper Texture Overlay */
                .wall-calendar-wrapper::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    opacity: 0.05;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    pointer-events: none;
                    z-index: 100;
                }

                @media (min-width: 768px) {
                    .wall-calendar-wrapper {
                        flex-direction: row;
                        align-items: stretch;
                        height: 650px;
                    }
                    .calendar-left { flex: 2; border-right: 1px solid rgba(0,0,0,0.06); }
                    .calendar-right { flex: 1; min-width: 320px; }
                }

                /* Left Panel */
                .calendar-left {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    background: #FAF8F4;
                }

                .calendar-rings {
                    display: flex;
                    justify-content: space-evenly;
                    padding: 12px 10%;
                    background: #FAF8F4;
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    z-index: 20;
                }
                .ring-hole {
                    width: 12px; height: 12px;
                    background: #222;
                    border-radius: 50%;
                    box-shadow: inset 0 3px 5px rgba(0,0,0,0.8);
                    position: relative;
                }
                .ring-wire {
                    position: absolute;
                    top: -12px; left: 50%;
                    transform: translateX(-50%);
                    width: 5px; height: 26px;
                    background: linear-gradient(to right, #666, #ccc, #666);
                    border-radius: 3px;
                    box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                }

                .hero-banner {
                    height: 200px;
                    position: relative;
                    transition: background 0.8s ease;
                    margin-top: 20px;
                }
                .hero-banner::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    opacity: 0.2;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                }

                .calendar-body {
                    padding: 30px 40px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .nav-btn {
                    background: none; border: none; cursor: pointer;
                    font-size: 24px; color: #333;
                    transition: color 0.2s, transform 0.2s;
                    border-radius: 50%;
                    width: 40px; height: 40px;
                    display: flex; justify-content: center; align-items: center;
                }
                .nav-btn:hover { color: var(--accent); transform: scale(1.1); background: #eee; }
                .nav-btn:active { transform: scale(0.95); }
                
                .month-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 36px;
                    margin: 0;
                    font-weight: 700;
                    color: var(--accent);
                    transition: color 0.8s ease;
                }
                .year-name {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 20px;
                    color: #333;
                    font-weight: 400;
                    margin-left: 10px;
                }

                .calendar-grid-container {
                    transform-origin: top;
                    backface-visibility: hidden;
                    width: 100%;
                }
                .calendar-grid-container[data-dir="next"] {
                    animation: flipNext 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .calendar-grid-container[data-dir="prev"] {
                    animation: flipPrev 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                @keyframes flipNext {
                    0% { transform: perspective(1000px) rotateX(90deg); opacity: 0; }
                    100% { transform: perspective(1000px) rotateX(0deg); opacity: 1; }
                }
                @keyframes flipPrev {
                    0% { transform: perspective(1000px) rotateX(-90deg); opacity: 0; }
                    100% { transform: perspective(1000px) rotateX(0deg); opacity: 1; }
                }

                .days-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    margin-bottom: 15px;
                }
                .day-name {
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: 700;
                    color: #444;
                    letter-spacing: 1px;
                    text-align: center;
                }

                .dates-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    grid-gap: 6px 0;
                }
                
                .cell-wrapper {
                    position: relative;
                    padding: 4px 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    outline: none;
                }
                .cell-wrapper.empty { cursor: default; }

                /* Selected Range Pill Backgrounds */
                .range-bg {
                    position: absolute;
                    top: 2px; bottom: 2px;
                    z-index: 10;
                    background: var(--accent-light);
                    transition: background 0.8s ease;
                }
                .range-bg.start { left: 50%; right: 0; border-top-left-radius: 50%; border-bottom-left-radius: 50%; }
                .range-bg.end { left: 0; right: 50%; border-top-right-radius: 50%; border-bottom-right-radius: 50%; }
                .range-bg.full { left: 0; right: 0; }

                /* The actual date circle */
                .date-number {
                    position: relative;
                    z-index: 15;
                    width: 36px; height: 36px;
                    display: flex; justify-content: center; align-items: center;
                    border-radius: 50%;
                    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                    font-weight: 500;
                    border: 1px solid transparent;
                }
                .cell-wrapper:focus-visible .date-number {
                    box-shadow: 0 0 0 2px var(--accent);
                }
                .cell-wrapper:not(.empty):hover .date-number {
                    transform: scale(1.15);
                    z-index: 25;
                }

                .date-number.today {
                    color: var(--accent);
                    font-weight: 700;
                }
                .date-number.today::after {
                    content: '';
                    position: absolute;
                    bottom: -6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px; height: 4px;
                    border-radius: 50%;
                    background: var(--accent);
                }

                .date-number.selected {
                    background: var(--accent) !important;
                    color: white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                }
                .date-number.selected.today::after {
                    background: white;
                }

                .holiday-dot {
                    position: absolute;
                    bottom: 4px;
                    width: 4px; height: 4px;
                    border-radius: 50%;
                    background: var(--accent);
                }
                .date-number.selected .holiday-dot { background: white; }

                .notes-badge {
                    position: absolute;
                    top: -2px; right: -2px;
                    background: #E76F51;
                    color: white;
                    font-size: 9px;
                    width: 14px; height: 14px;
                    display: flex; justify-content: center; align-items: center;
                    border-radius: 50%;
                    font-weight: 700;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                }

                /* Tooltip */
                .cell-wrapper .tooltip {
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s, transform 0.2s;
                    position: absolute;
                    bottom: 100%; left: 50%;
                    transform: translateX(-50%) translateY(4px);
                    background: #2C2C2C;
                    color: #FAF8F4;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    white-space: nowrap;
                    z-index: 30;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .cell-wrapper .tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%; left: 50%;
                    transform: translateX(-50%);
                    border-width: 4px; border-style: solid;
                    border-color: #2C2C2C transparent transparent transparent;
                }
                .cell-wrapper:hover .tooltip {
                    opacity: 1;
                    transform: translateX(-50%) translateY(-2px);
                }

                /* Right Panel (Notes) */
                .calendar-right {
                    padding: 35px 30px;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    z-index: 10;
                    position: relative;
                }
                
                .notes-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 26px;
                    margin: 0 0 20px 0;
                    border-bottom: 1px solid #EBE8E0;
                    padding-bottom: 15px;
                    display: flex; justify-content: space-between; align-items: baseline;
                }

                .selected-range-info {
                    font-size: 13px;
                    margin-bottom: 20px;
                    color: #222;
                }
                .selected-range-info .value {
                    font-weight: 700;
                    color: var(--accent);
                    margin-left: 6px;
                    font-size: 14px;
                }

                .add-note-box {
                    display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;
                }
                .add-note-box textarea {
                    font-family: 'DM Sans', sans-serif;
                    padding: 14px;
                    border: 1px solid #EBE8E0;
                    border-radius: 8px;
                    resize: none;
                    outline: none;
                    transition: all 0.3s;
                    background: #FAF8F4;
                    font-size: 14px;
                    line-height: 1.5;
                }
                .add-note-box textarea:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-light);
                    background: white;
                }
                .add-note-box textarea::placeholder {
                    color: #555;
                }
                .add-note-box button {
                    background: var(--accent);
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 700;
                    font-family: 'DM Sans', sans-serif;
                    transition: all 0.2s;
                    font-size: 14px;
                }
                .add-note-box button:hover:not(:disabled) {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .add-note-box button:active:not(:disabled) {
                    transform: translateY(1px);
                }
                .add-note-box button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .saved-notes-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 5px;
                }
                
                /* Custom Scrollbar */
                .saved-notes-list::-webkit-scrollbar { width: 6px; }
                .saved-notes-list::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
                .saved-notes-list::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
                .saved-notes-list::-webkit-scrollbar-thumb:hover { background: #999; }

                .empty-notes {
                    color: #444;
                    font-style: italic;
                    text-align: center;
                    margin-top: 30px;
                    font-size: 14px;
                }

                .note-card {
                    background: #FAF8F4;
                    padding: 16px;
                    border-radius: 10px;
                    border-left: 4px solid var(--accent);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                    transition: transform 0.2s;
                }
                .note-card:hover {
                    transform: translateX(2px);
                }
                .note-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 8px;
                }
                .note-range {
                    font-size: 11px; font-weight: 700; color: var(--accent);
                    text-transform: uppercase; letter-spacing: 0.5px;
                }
                .delete-btn {
                    background: none; border: none; cursor: pointer; color: #555;
                    font-size: 20px; line-height: 1; padding: 0 4px;
                    transition: color 0.2s;
                }
                .delete-btn:hover { color: #E76F51; }
                .note-text {
                    font-size: 14px; line-height: 1.5; color: #111; word-wrap: break-word;
                }
            `}</style>

            <div className="calendar-left">
                <div className="calendar-rings">
                    {Array.from({length: 12}).map((_, i) => (
                        <div key={i} className="ring-hole">
                            <div className="ring-wire" />
                        </div>
                    ))}
                </div>

                <div className="hero-banner" style={{ 
                    backgroundImage: `url('/hero_banana.png')`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }} />
                
                <div className="calendar-body">
                    <div className="calendar-header">
                        <button className="nav-btn" onClick={handlePrevMonth} aria-label="Previous Month">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                        </button>
                        <h2 className="month-name">
                            {monthName} <span className="year-name">{year}</span>
                        </h2>
                        <button className="nav-btn" onClick={handleNextMonth} aria-label="Next Month">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                    </div>

                    <div className="calendar-grid-container" data-dir={slideDir} key={animKey}>
                        <div className="days-row">
                            {DAYS_OF_WEEK.map(d => <div key={d} className="day-name">{d}</div>)}
                        </div>
                        <div className="dates-grid">
                            {calendarDays.map((date, idx) => {
                                if (!date) return <div key={`empty-${idx}`} className="cell-wrapper empty" />;

                                const dateTime = date.getTime();
                                const isSelectionStart = rangeStart && isSameDay(date, rangeStart);
                                const isSelectionEnd = rangeEnd && isSameDay(date, rangeEnd);
                                const isSelected = isSelectionStart || isSelectionEnd || (rangeStart && !rangeEnd && isSameDay(date, rangeStart));
                                const isToday = isSameDay(date, new Date());
                                const holiday = getHoliday(date);
                                
                                // Notes for this day
                                const dayNotesCount = notes.filter(n => dateTime >= n.start.getTime() && dateTime <= n.end.getTime()).length;

                                // Pill background logic
                                let bgMode = null;
                                let hoverMode = false;

                                if (minEffRangeDate && maxEffRangeDate) {
                                    const effStartStr = new Date(minEffRangeDate).toDateString();
                                    const effEndStr = new Date(maxEffRangeDate).toDateString();
                                    const dateStr = date.toDateString();

                                    if (effStartStr !== effEndStr) {
                                        if (dateStr === effStartStr) bgMode = 'start';
                                        else if (dateStr === effEndStr) bgMode = 'end';
                                        else if (dateTime > minEffRangeDate && dateTime < maxEffRangeDate) bgMode = 'full';
                                    }

                                    if (!rangeEnd && hoverDate) hoverMode = true;
                                }

                                return (
                                    <div 
                                        key={date.toISOString()}
                                        id={`day-cell-${date.getDate()}`}
                                        tabIndex={0}
                                        className="cell-wrapper"
                                        onMouseEnter={() => !rangeEnd && setHoverDate(date)}
                                        onMouseLeave={() => setHoverDate(null)}
                                        onClick={() => handleDateClick(date)}
                                        onKeyDown={(e) => handleKeyDown(e, date)}
                                        aria-label={date.toDateString() + (isSelected ? " selected" : "")}
                                    >
                                        {bgMode && (
                                            <div 
                                                className={`range-bg ${bgMode}`} 
                                                style={{ opacity: hoverMode ? 0.3 : 1 }} 
                                            />
                                        )}
                                        <div className={`date-number ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}>
                                            {date.getDate()}
                                            {holiday && <div className="holiday-dot" />}
                                            {dayNotesCount > 0 && <div className="notes-badge">{dayNotesCount}</div>}
                                        </div>

                                        {holiday && <div className="tooltip">{holiday}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="calendar-right">
                <h3 className="notes-title">
                    Notes
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#ccc'}}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </h3>
                
                <div className="selected-range-info">
                    {rangeStart ? (
                        <>Selected: <span className="value">{formatRange(rangeStart, rangeEnd)}</span></>
                    ) : (
                        "Select a date or range to add notes."
                    )}
                </div>

                <div className="add-note-box" style={{ opacity: rangeStart ? 1 : 0.4, pointerEvents: rangeStart ? 'auto' : 'none' }}>
                    <textarea 
                        value={noteInput} 
                        onChange={e => setNoteInput(e.target.value)}
                        placeholder="Write a note connecting to the selected days..."
                        rows={3}
                        tabIndex={rangeStart ? 0 : -1}
                    />
                    <button 
                        onClick={handleSaveNote} 
                        disabled={!noteInput.trim()}
                        tabIndex={rangeStart ? 0 : -1}
                    >
                        Save Note
                    </button>
                </div>

                <div className="saved-notes-list">
                    {notes.length === 0 && <div className="empty-notes">Your pinned notes will appear here.</div>}
                    {notes.map(n => (
                        <div key={n.id} className="note-card">
                            <div className="note-header">
                                <span className="note-range">{formatRange(n.start, n.end)}</span>
                                <button className="delete-btn" onClick={() => handleDeleteNote(n.id)} aria-label="Delete note">×</button>
                            </div>
                            <div className="note-text">{n.text}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </div>
    );
}