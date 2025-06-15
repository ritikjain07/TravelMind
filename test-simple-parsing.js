// Simple test of specific activity lines
const activityLines = [
    "* Morning (9am-12pm): Start at the Grand Palace ($15 entrance) – Thailand's most iconic landmark.",
    "* Afternoon (12pm-4pm): Lunch at Thipsamai Pad Thai ($5-10) – a Bangkok institution!",
    "* Evening (6pm-9pm): Take a long-tail boat tour through the klongs (canals) to see local life ($10-15)."
];

console.log('🚀 Testing specific activity lines...\n');

const activityPatterns = [
    /^\*\s*(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,        // * Morning (9am-12pm): Activity (MAIN FORMAT)
    /^\*\s*\*\*(Morning|Afternoon|Evening)\s*\([^)]*\):\*\*\s*(.+)/i, // * **Morning (9am-12pm):** Activity
    /^\*\s*\*\*(Morning|Afternoon|Evening)\*\*:\s*(.+)/i,             // * **Morning**: Activity
    /^\*\s*(Morning|Afternoon|Evening):\s*(.+)/i,                     // * Morning: Activity
    /^(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,              // Morning (9am-12pm): Activity
    /^(Morning|Afternoon|Evening):\s*(.+)/i                           // Morning: Activity
];

activityLines.forEach((line, index) => {
    console.log(`\n--- Testing line ${index + 1} ---`);
    console.log('Line:', line);
    console.log('Length:', line.length);
    console.log('Starts with *:', line.startsWith('*'));
    
    let matched = false;
    for (let i = 0; i < activityPatterns.length; i++) {
        const pattern = activityPatterns[i];
        const match = line.match(pattern);
        if (match) {
            console.log(`✅ MATCHED pattern ${i}:`, pattern.source);
            console.log('✅ Groups:', match);
            matched = true;
            break;
        }
    }
    
    if (!matched) {
        console.log('❌ NO PATTERNS MATCHED');
        // Test the main pattern manually
        const mainPattern = /^\*\s*(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i;
        console.log('Testing main pattern manually...');
        console.log('Pattern:', mainPattern.source);
        console.log('Test result:', mainPattern.test(line));
        
        // Check each part
        console.log('Starts with *:', /^\*/.test(line));
        console.log('Has Morning/Afternoon/Evening:', /(Morning|Afternoon|Evening)/.test(line));
        console.log('Has parentheses:', /\([^)]*\)/.test(line));
        console.log('Has colon:', /:/.test(line));
    }
});

console.log('\n🎯 Test complete!');
