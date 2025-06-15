// Quick test of complete parsing logic
const testLine = "* Morning (9:00 AM - 12:00 PM): Arrive at José María Córdova International Airport and take transportation to your accommodation in El Poblado.";

console.log('Testing complete parsing with actual line...');
console.log('Input:', testLine);

// Test the main pattern
const pattern = /^\*\s*(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i;
const match = testLine.match(pattern);

if (match) {
    console.log('✅ Pattern matched!');
    console.log('Match groups:', match);
    
    const [, timeOfDay, activityText] = match;
    console.log('Time of day:', timeOfDay);
    console.log('Activity:', activityText);
    
    // Test time extraction
    const timeMatch = testLine.match(/\(([^)]*)\)/);
    if (timeMatch) {
        console.log('Time string:', timeMatch[1]);
        
        const timeConversion = timeMatch[1].match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeConversion) {
            console.log('Time conversion:', timeConversion);
            let hours = parseInt(timeConversion[1]);
            const minutes = parseInt(timeConversion[2]);
            const ampm = timeConversion[3];
            
            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            
            const finalTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            console.log('Final time:', finalTime);
        }
    }
} else {
    console.log('❌ Pattern did not match');
}

console.log('Test complete!');
