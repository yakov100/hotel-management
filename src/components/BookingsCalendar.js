const handleDateClick = (date) => {
    if (onDateClick) {
        onDateClick(date);
    }
};

<td
    key={day}
    className={`border p-2 text-center ${isToday ? 'bg-blue-100' : ''} ${isBooked ? 'bg-red-100' : ''} ${isSelected ? 'bg-green-100' : ''} ${isPast ? 'bg-gray-100' : ''} ${!isPast ? 'cursor-pointer hover:bg-gray-100' : ''}`}
    onClick={() => !isPast && handleDateClick(new Date(year, month, day))}
>
    {day}
</td> 