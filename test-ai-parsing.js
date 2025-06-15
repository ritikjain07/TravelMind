// Test script to debug AI parsing with actual Gemini response format
const testGeminiResponse = `Hey [Name]!

Stoked you're planning a trip to Bangkok! Here's a personalized 3-day itinerary that balances your love for exploration with comfort and culture:

**Day 1: Grand Palace & Cultural Immersion**

* Morning (9am-12pm): Start at the Grand Palace ($15 entrance) – Thailand's most iconic landmark. Explore the intricate architecture and Wat Phra Kaew (Temple of the Emerald Buddha).

* Afternoon (12pm-4pm): Lunch at Thipsamai Pad Thai ($5-10) – a Bangkok institution! Then walk to Wat Pho temple ($3) to see the massive reclining Buddha and enjoy a traditional Thai massage ($20-30).

* Evening (6pm-9pm): Take a long-tail boat tour through the klongs (canals) to see local life ($10-15). End with dinner at a riverside restaurant like The Deck by Arun Residence ($25-40) with views of Wat Arun.

**Day 2: Markets & Modern Bangkok**

* Morning (8am-12pm): Early visit to Chatuchak Weekend Market (free entry) – one of the world's largest markets. Try street food like mango sticky rice ($2-3) and shop for souvenirs.

* Afternoon (1pm-5pm): Lunch at Or Tor Kor Market ($8-15) for authentic Thai cuisine. Then explore modern Bangkok at MBK Center or Siam Paragon for shopping and people-watching.

* Evening (6pm-10pm): Experience Bangkok's nightlife in a cultural way – visit a rooftop bar like Sky Bar at Lebua ($15-25 drinks) for sunset views, then explore the vibrant Khao San Road ($5-10 street food).

**Day 3: Floating Markets & Relaxation**

* Morning (7am-12pm): Day trip to Damnoen Saduak Floating Market ($30-50 including transport) – experience traditional Thai market culture on the water.

* Afternoon (1pm-5pm): Return to Bangkok and visit Jim Thompson House ($5) to learn about Thai silk heritage. Relax at Lumpini Park (free) for some downtime.

* Evening (6pm-9pm): Farewell dinner at Blue Elephant Restaurant ($40-60) for refined Thai cuisine, or keep it casual at Chinatown's street food stalls ($10-20).

**Important Notes:**
* **Transportation:** Use BTS Skytrain and MRT subway ($1-3 per ride) – efficient and air-conditioned!
* **Budget:** This itinerary fits your $500 budget comfortably with room for extra shopping or experiences.
* **Accommodation:** Stay near BTS stations in Sukhumvit or Silom areas for easy access.

This is just a framework – feel free to adjust based on your energy levels and interests!

Have an amazing trip!

Best,
[Your AI Travel Assistant]`;

// Function to test parsing (copied from TripPlanner.tsx)
function parseItineraryText(text, duration) {
    const items = [];
    
    try {
        // Clean the text and split into lines
        const cleanText = text.replace(/\*\*/g, '').replace(/\#/g, '');
        const lines = cleanText.split('\n').filter(line => line.trim());
        
        let currentDay = 1;
        let currentTime = '09:00';
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            console.log('Processing line:', trimmedLine);
            
            // Skip empty lines and headers
            if (!trimmedLine || trimmedLine.startsWith('Hey ') || trimmedLine.startsWith('Stoked ') ||
                trimmedLine.startsWith('**Important Notes:**') || trimmedLine.startsWith('This is just') ||
                trimmedLine.startsWith('Best,') || trimmedLine.startsWith('[Your Name') ||
                trimmedLine.startsWith('Have an amazing') || trimmedLine.startsWith('* **Transportation:') ||
                trimmedLine.startsWith('* **Festivals:') || trimmedLine.startsWith('* **Budget:') ||
                trimmedLine.startsWith('* **Accommodation:') || trimmedLine.startsWith('Cheers,')) {
                console.log('Skipping line:', trimmedLine);
                continue;
            }
            
            // Look for day markers
            const dayMatch = trimmedLine.match(/Day\s+(\d+)/);
            if (dayMatch) {
                currentDay = parseInt(dayMatch[1]);
                currentTime = '09:00'; // Reset time for new day
                continue;
            }
            
            // Extract time of day and set current time
            if (trimmedLine.toLowerCase().includes('morning')) {
                currentTime = '09:00';
                continue;
            } else if (trimmedLine.toLowerCase().includes('afternoon')) {
                currentTime = '14:00';
                continue;
            } else if (trimmedLine.toLowerCase().includes('evening') || trimmedLine.toLowerCase().includes('night')) {
                currentTime = '18:00';
                continue;
            }
            
            // Debug: Check if line starts with * and contains time patterns
            if (trimmedLine.startsWith('*') && (trimmedLine.includes('Morning') || trimmedLine.includes('Afternoon') || trimmedLine.includes('Evening'))) {
                console.log('🔍 TESTING activity line:', trimmedLine);
                console.log('🔍 Line length:', trimmedLine.length);
                console.log('🔍 First 50 chars:', JSON.stringify(trimmedLine.substring(0, 50)));
            }
            
            // Extract activities - look for actual Gemini format: * Morning (9am-12pm): Activity
            const activityPatterns = [
                /^\*\s*(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,        // * Morning (9am-12pm): Activity (MAIN FORMAT)
                /^\*\s*\*\*(Morning|Afternoon|Evening)\s*\([^)]*\):\*\*\s*(.+)/i, // * **Morning (9am-12pm):** Activity
                /^\*\s*\*\*(Morning|Afternoon|Evening)\*\*:\s*(.+)/i,             // * **Morning**: Activity
                /^\*\s*(Morning|Afternoon|Evening):\s*(.+)/i,                     // * Morning: Activity
                /^(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,              // Morning (9am-12pm): Activity
                /^(Morning|Afternoon|Evening):\s*(.+)/i                           // Morning: Activity
            ];
            
            let activityLineMatch = null;
            for (let i = 0; i < activityPatterns.length; i++) {
                const pattern = activityPatterns[i];
                activityLineMatch = trimmedLine.match(pattern);
                if (activityLineMatch) {
                    console.log('✅ MATCHED pattern #' + i + ':', pattern.source);
                    console.log('✅ MATCHED line:', trimmedLine);
                    console.log('✅ MATCH GROUPS:', activityLineMatch);
                    break;
                } else if (trimmedLine.startsWith('*') && (trimmedLine.includes('Morning') || trimmedLine.includes('Afternoon') || trimmedLine.includes('Evening'))) {
                    console.log('❌ Pattern #' + i + ' failed:', pattern.source);
                    console.log('❌ Testing against:', JSON.stringify(trimmedLine.substring(0, 30)));
                }
            }
            
            if (activityLineMatch) {
                const [, timeOfDay, activityText] = activityLineMatch;
                console.log('📝 Extracted activity:', { timeOfDay, activityText });
                
                // Extract time from the parentheses if available (e.g., "9am" from "Morning (9am-12pm):")
                const timeMatch = trimmedLine.match(/\(([^)]*)\)/);
                let extractedTime = null;
                
                if (timeMatch && timeMatch[1]) {
                    const timeStr = timeMatch[1];
                    // Extract start time from ranges like "9am-12pm" or "9:00 AM"
                    const timeConversion = timeStr.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?/i);
                    if (timeConversion) {
                        let hours = parseInt(timeConversion[1]);
                        const minutes = timeConversion[2] ? parseInt(timeConversion[2]) : 0;
                        const ampm = timeConversion[3];
                        
                        // Convert to 24-hour format
                        if (ampm && ampm.toLowerCase() === 'pm' && hours !== 12) {
                            hours += 12;
                        } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
                            hours = 0;
                        }
                        
                        extractedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    }
                }
                
                // Use extracted time or fall back to default time based on period
                if (extractedTime) {
                    currentTime = extractedTime;
                } else {
                    switch (timeOfDay.toLowerCase()) {
                        case 'morning':
                            currentTime = '09:00';
                            break;
                        case 'afternoon':
                            currentTime = '14:00';
                            break;
                        case 'evening':
                            currentTime = '18:00';
                            break;
                    }
                }
                
                // Extract cost information
                const costPatterns = [
                    /\$(\d+)/g,           // Standard $number
                    /~\$(\d+)/g,          // Approximate ~$number  
                    /\(\$(\d+)/g,         // In parentheses ($number
                    /\(\~\$(\d+)/g        // In parentheses (~$number
                ];
                
                let estimatedCost = 30; // Default
                for (const pattern of costPatterns) {
                    const costMatch = trimmedLine.match(pattern);
                    if (costMatch) {
                        estimatedCost = parseInt(costMatch[0].replace(/[^\d]/g, ''));
                        break;
                    }
                }
                
                // Clean up activity text - remove cost references and extra info
                const cleanActivity = activityText
                    .replace(/\([^)]*\$[^)]*\)/g, '') // Remove cost info in parentheses
                    .replace(/\$\d+[^.]*\.?/g, '') // Remove standalone cost mentions
                    .replace(/~\$\d+[^.]*\.?/g, '') // Remove approximate costs
                    .replace(/\s+/g, ' ')
                    .trim();
                
                if (cleanActivity.length > 10) {
                    items.push({
                        day: currentDay,
                        time: currentTime,
                        activity: cleanActivity,
                        location: 'Bangkok',
                        description: '',
                        estimatedCost: estimatedCost,
                        duration: 120,
                        type: 'activity'
                    });
                    
                    console.log('✅ Added activity:', {
                        day: currentDay,
                        time: currentTime,
                        activity: cleanActivity,
                        cost: estimatedCost
                    });
                }
                continue;
            }
            
            // Debug: Log lines that don't match any activity pattern
            if (trimmedLine.length > 5) { // Only log substantial lines
                console.log('❌ NO MATCH for line:', trimmedLine);
            }
        }
        
        console.log('📊 Final parsed items:', items.length);
        return items;
        
    } catch (error) {
        console.error('Error parsing itinerary:', error);
        return [];
    }
}

// Run the test
console.log('🚀 Testing AI parsing with actual Gemini response format...\n');
const result = parseItineraryText(testGeminiResponse, 3);
console.log('\n🎯 FINAL RESULT:', result.length, 'activities parsed');
result.forEach((item, index) => {
    console.log(`${index + 1}. Day ${item.day} at ${item.time}: ${item.activity} ($${item.estimatedCost})`);
});
