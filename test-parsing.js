// Test AI Parsing Function
// Run this in browser console to test the parsing

const testGeminiResponse = `
Hey there, adventure seeker! 🎒✨

Stoked to help you plan an epic trip! Here's a fun-filled itinerary:

**Day 1: Arrival & Exploration**

* **Morning (2h, $0):** Explore the historic city center and visit local markets
* **Afternoon (3h, $25):** Take a guided tour of the main cathedral and surrounding squares
* **Evening (2h, $15):** Enjoy dinner at a traditional restaurant with live music

**Day 2: Cultural Immersion**  

* **Morning (3h, $20):** Visit the national museum and art galleries
* **Afternoon (2h, $10):** Take a cooking class to learn local cuisine
* **Evening (1h, $5):** Sunset walk through the old town and visit local bars

Best wishes for an amazing trip!
`;

// Test the parsing function (run in browser console where the function is available)
console.log('Testing AI Parsing...');
console.log('Sample response:', testGeminiResponse);

// This will test if the new regex pattern works correctly
const testLines = testGeminiResponse.split('\n');
testLines.forEach(line => {
  const trimmed = line.trim();
  const match = trimmed.match(/^\*\s*\*?\*?(Morning|Afternoon|Evening)[^:]*:\s*(.+)/i);
  if (match) {
    console.log('✅ MATCHED:', {
      timeOfDay: match[1],
      activity: match[2],
      originalLine: trimmed
    });
  }
});
