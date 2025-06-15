// Test the new regex patterns with actual Gemini format
const testLines = [
    "* Morning (9:00 AM - 12:00 PM): Arrive at José María Córdova International Airport",
    "* Afternoon (12:00 PM - 4:00 PM): Settle in and grab a delicious and cheap lunch",
    "* Evening (4:00 PM - Late): Enjoy a *tinto* (small Colombian coffee) at a local",
    "* Morning & Afternoon: Sleep in! Use this day to revisit your favorite spots",
    "* Evening: Immerse yourself in Medellín's diverse nightlife"
];

console.log('🚀 Testing new regex patterns with actual Gemini format...\n');

const activityPatterns = [
    /^\*\s*(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,                    // * Morning (9:00 AM - 12:00 PM): Activity
    /^\*\s*(Morning|Afternoon|Evening)\s*&\s*(Afternoon|Evening):\s*(.+)/i,      // * Morning & Afternoon: Activity
    /^\*\s*(Morning|Afternoon|Evening):\s*(.+)/i,                                // * Morning: Activity
    /^\*\s*\*\*(Morning|Afternoon|Evening)\s*\([^)]*\):\*\*\s*(.+)/i,           // * **Morning (time):** Activity
    /^\*\s*\*\*(Morning|Afternoon|Evening)\*\*:\s*(.+)/i,                       // * **Morning**: Activity
    /^(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,                        // Morning (time): Activity
    /^(Morning|Afternoon|Evening):\s*(.+)/i                                     // Morning: Activity
];

testLines.forEach((line, index) => {
    console.log(`\n--- Testing line ${index + 1} ---`);
    console.log('Line:', line);
    
    let matched = false;
    for (let i = 0; i < activityPatterns.length; i++) {
        const pattern = activityPatterns[i];
        const match = line.match(pattern);
        if (match) {
            console.log(`✅ MATCHED pattern ${i}:`, pattern.source);
            console.log('✅ Groups:', match);
            
            // Test time extraction
            const timeMatch = line.match(/\(([^)]*)\)/);
            if (timeMatch && timeMatch[1]) {
                console.log('🕐 Time string found:', timeMatch[1]);
                
                const timePatterns = [
                    /(\d{1,2}):(\d{2})\s*(AM|PM)/i,           // 9:00 AM
                    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-/i,       // 9:00 AM - (start time from range)
                    /(\d{1,2})\s*(AM|PM)/i,                   // 9 AM
                    /(\d{1,2})\s*(am|pm)/i                    // 9am
                ];
                
                for (const timePattern of timePatterns) {
                    const timeConversion = timeMatch[1].match(timePattern);
                    if (timeConversion) {
                        console.log('🕐 Time conversion match:', timeConversion);
                        let hours = parseInt(timeConversion[1]);
                        const minutes = timeConversion[2] ? parseInt(timeConversion[2]) : 0;
                        const ampm = timeConversion[3];
                        
                        if (ampm && ampm.toLowerCase() === 'pm' && hours !== 12) {
                            hours += 12;
                        } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
                            hours = 0;
                        }
                        
                        const extractedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                        console.log('🕐 Final extracted time:', extractedTime);
                        break;
                    }
                }
            }
            
            matched = true;
            break;
        }
    }
    
    if (!matched) {
        console.log('❌ NO PATTERNS MATCHED');
    }
});

console.log('\n🎯 Test complete!');
