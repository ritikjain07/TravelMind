// Test regex patterns with actual Gemini output
const testLine = "* Morning (10am-12pm): Arrive at Suvarnabhumi Airport (BKK). Take the Airport Rail Link to Phaya Thai station ($2-3), then a taxi or Grab ($5-10) to your hotel near the Chao Phraya River.";

console.log('Testing line:', testLine);

const patterns = [
  /^\*\s*(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,        // * Morning (10am-12pm): Activity
  /^\*\s*\*\*(Morning|Afternoon|Evening)\s*\([^)]*\):\*\*\s*(.+)/i, // * **Morning (10am-12pm):** Activity  
  /^\*\s*\*\*(Morning|Afternoon|Evening)\*\*:\s*(.+)/i,             // * **Morning**: Activity
  /^\*\s*(Morning|Afternoon|Evening):\s*(.+)/i,                     // * Morning: Activity
  /^(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,              // Morning (10am-12pm): Activity
  /^(Morning|Afternoon|Evening):\s*(.+)/i                           // Morning: Activity
];

patterns.forEach((pattern, index) => {
  const match = testLine.match(pattern);
  console.log(`Pattern ${index}:`, pattern.source);
  console.log(`Match:`, match ? '✅ YES' : '❌ NO');
  if (match) {
    console.log(`  Time period: "${match[1]}"`);
    console.log(`  Activity: "${match[2]}"`);
  }
  console.log('---');
});

// Also test basic checks
console.log('Starts with *:', testLine.startsWith('*'));
console.log('Contains Morning:', testLine.includes('Morning'));
console.log('Contains Afternoon:', testLine.includes('Afternoon'));
console.log('Contains Evening:', testLine.includes('Evening'));
