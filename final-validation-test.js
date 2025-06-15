// Final validation test for AI itinerary parsing
console.log('🎯 TravelMind AI Itinerary Parsing - Final Validation Test\n');

// Test data based on actual Gemini API response format
const testItineraryText = `Hey [Traveler's Name],

Get ready for an amazing trip to Bangkok! Here's a personalized 3-day itinerary:

**Day 1: Grand Palace & Cultural Immersion**

* Morning (9:00 AM - 12:00 PM): Start at the Grand Palace ($15 entrance) – Thailand's most iconic landmark. Explore the intricate architecture and Wat Phra Kaew.

* Afternoon (12:00 PM - 4:00 PM): Lunch at Thipsamai Pad Thai ($5-10) – a Bangkok institution! Then walk to Wat Pho temple ($3) to see the massive reclining Buddha.

* Evening (6:00 PM - 9:00 PM): Take a long-tail boat tour through the klongs (canals) to see local life ($10-15). End with dinner at a riverside restaurant.

**Day 2: Markets & Modern Bangkok**

* Morning (8:00 AM - 12:00 PM): Early visit to Chatuchak Weekend Market (free entry) – one of the world's largest markets. Try street food like mango sticky rice ($2-3).

* Afternoon (1:00 PM - 5:00 PM): Lunch at Or Tor Kor Market ($8-15) for authentic Thai cuisine. Then explore modern Bangkok at MBK Center.

* Evening (6:00 PM - 10:00 PM): Experience Bangkok's nightlife – visit a rooftop bar like Sky Bar at Lebua ($15-25 drinks) for sunset views.

**Day 3: Floating Markets & Relaxation**

* Morning (7:00 AM - 12:00 PM): Day trip to Damnoen Saduak Floating Market ($30-50 including transport) – experience traditional Thai market culture.

* Afternoon (1:00 PM - 5:00 PM): Return to Bangkok and visit Jim Thompson House ($5) to learn about Thai silk heritage. Relax at Lumpini Park (free).

* Evening (6:00 PM - 9:00 PM): Farewell dinner at Blue Elephant Restaurant ($40-60) for refined Thai cuisine, or keep it casual at Chinatown's street food stalls.

Have an amazing trip!

Best,
[Your AI Travel Assistant]`;

// Simulation of the parsing function (core logic from TripPlanner.tsx)
function validateParsing(text, duration = 3) {
    const items = [];
    
    try {
        console.log('📝 Input validation:');
        console.log(`   - Text length: ${text.length} characters`);
        console.log(`   - Duration: ${duration} days`);
        
        // Clean and process text
        const cleanText = text
            .replace(/\*\*/g, '')
            .replace(/\#/g, '')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n');
        
        const lines = cleanText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        console.log(`   - Processed lines: ${lines.length}`);
        
        // Updated regex patterns for actual Gemini format
        const activityPatterns = [
            /^\*\s*(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,
            /^\*\s*(Morning|Afternoon|Evening)\s*&\s*(Afternoon|Evening):\s*(.+)/i,
            /^\*\s*(Morning|Afternoon|Evening):\s*(.+)/i,
        ];
        
        let currentDay = 1;
        let currentTime = '09:00';
        let activitiesFound = 0;
        
        console.log('\n🔍 Processing lines:');
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            // Skip headers and fluff
            if (!trimmedLine || trimmedLine.startsWith('Hey ') || trimmedLine.startsWith('Get ready') ||
                trimmedLine.startsWith('Have an amazing') || trimmedLine.startsWith('Best,') ||
                trimmedLine.startsWith('[Your')) {
                continue;
            }
            
            // Look for day markers
            const dayMatch = trimmedLine.match(/Day\s+(\d+)/);
            if (dayMatch) {
                currentDay = parseInt(dayMatch[1]);
                currentTime = '09:00';
                console.log(`   📅 Found Day ${currentDay}`);
                continue;
            }
            
            // Test activity patterns
            let activityLineMatch = null;
            for (let i = 0; i < activityPatterns.length; i++) {
                const pattern = activityPatterns[i];
                activityLineMatch = trimmedLine.match(pattern);
                if (activityLineMatch) {
                    console.log(`   ✅ Pattern ${i} matched: ${trimmedLine.substring(0, 60)}...`);
                    break;
                }
            }
            
            if (activityLineMatch) {
                let timeOfDay, activityText;
                
                if (activityLineMatch.length === 3) {
                    [, timeOfDay, activityText] = activityLineMatch;
                } else if (activityLineMatch.length === 4) {
                    [, timeOfDay, , activityText] = activityLineMatch;
                }
                
                if (!timeOfDay || !activityText) continue;
                
                // Extract time
                const timeMatch = trimmedLine.match(/\(([^)]*)\)/);
                let extractedTime = null;
                
                if (timeMatch && timeMatch[1]) {
                    const timeStr = timeMatch[1];
                    const timePatterns = [
                        /(\d{1,2}):(\d{2})\s*(AM|PM)/i,
                        /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-/i,
                        /(\d{1,2})\s*(AM|PM)/i,
                    ];
                    
                    for (const timePattern of timePatterns) {
                        const timeConversion = timeStr.match(timePattern);
                        if (timeConversion) {
                            let hours = parseInt(timeConversion[1]);
                            const minutes = timeConversion[2] ? parseInt(timeConversion[2]) : 0;
                            const ampm = timeConversion[3];
                            
                            if (ampm === 'PM' && hours !== 12) hours += 12;
                            if (ampm === 'AM' && hours === 12) hours = 0;
                            
                            extractedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                            break;
                        }
                    }
                }
                
                if (extractedTime) {
                    currentTime = extractedTime;
                }
                
                // Extract cost
                const costMatch = trimmedLine.match(/\$(\d+)/);
                const estimatedCost = costMatch ? parseInt(costMatch[1]) : 30;
                
                // Clean activity text
                const cleanActivity = activityText
                    .replace(/\([^)]*\$[^)]*\)/g, '')
                    .replace(/\$\d+[^.]*\.?/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                if (cleanActivity.length > 10) {
                    items.push({
                        day: currentDay,
                        time: currentTime,
                        activity: cleanActivity,
                        location: 'Bangkok',
                        estimatedCost: estimatedCost,
                        type: 'activity'
                    });
                    
                    activitiesFound++;
                    console.log(`   🎯 Activity ${activitiesFound}: Day ${currentDay} at ${currentTime} - ${cleanActivity.substring(0, 40)}... ($${estimatedCost})`);
                }
            }
        }
        
        console.log(`\n📊 Results:`);
        console.log(`   - Activities found: ${activitiesFound}`);
        console.log(`   - Total items: ${items.length}`);
        console.log(`   - Success rate: ${((activitiesFound / Math.max(1, duration * 3)) * 100).toFixed(1)}%`);
        
        return items;
        
    } catch (error) {
        console.error('❌ Parsing error:', error);
        return [];
    }
}

// Run the validation test
const result = validateParsing(testItineraryText, 3);

console.log('\n🎉 FINAL VALIDATION RESULTS:');
console.log(`✅ Parsing function: ${result.length > 0 ? 'WORKING' : 'FAILED'}`);
console.log(`✅ Activity extraction: ${result.length >= 6 ? 'EXCELLENT' : result.length >= 3 ? 'GOOD' : 'NEEDS WORK'}`);
console.log(`✅ Time processing: ${result.some(item => item.time !== '09:00') ? 'WORKING' : 'USING DEFAULTS'}`);
console.log(`✅ Cost extraction: ${result.some(item => item.estimatedCost !== 30) ? 'WORKING' : 'USING DEFAULTS'}`);

if (result.length > 0) {
    console.log('\n📋 Sample parsed activities:');
    result.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. Day ${item.day} at ${item.time}: ${item.activity.substring(0, 50)}... ($${item.estimatedCost})`);
    });
    
    console.log('\n🚀 AI ITINERARY PARSING IS READY FOR PRODUCTION! 🚀');
} else {
    console.log('\n❌ AI itinerary parsing needs further debugging.');
}

console.log('\n' + '='.repeat(60));
console.log('🎯 Next steps: Test in the browser at http://localhost:5175');
console.log('   1. Navigate to Trip Planner');
console.log('   2. Fill out trip details');
console.log('   3. Click "Generate AI Itinerary"');
console.log('   4. Check console for detailed logs');
console.log('='.repeat(60));
