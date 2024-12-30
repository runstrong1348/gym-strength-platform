import fetch from 'node-fetch';

const API_KEY = 'a3Xu45fsY4puoE5Bpcbb5A==sZZ6LbawCO78fwEI';

async function fetchExercises() {
  try {
    // Test different muscles and types
    const queries = [
      { muscle: 'hamstrings', type: 'stretching' },  // For leg swings
      { muscle: 'quadriceps', type: 'strength' },    // For lunges and squats
      { muscle: 'lower_back', type: 'strength' }     // For deadlifts
    ];

    for (const query of queries) {
      const queryString = Object.entries(query)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      console.log(`\nSearching for ${query.muscle} exercises (${query.type}):`);
      
      const response = await fetch(`https://api.api-ninjas.com/v1/exercises?${queryString}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
      }

      const exercises = await response.json();
      console.log(`Found ${exercises.length} exercises:`);
      exercises.forEach(ex => {
        console.log(`\n- ${ex.name}`);
        console.log(`  Type: ${ex.type}`);
        console.log(`  Muscle: ${ex.muscle}`);
        console.log(`  Equipment: ${ex.equipment}`);
        console.log(`  Difficulty: ${ex.difficulty}`);
        console.log(`  Instructions: ${ex.instructions.slice(0, 100)}...`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchExercises();
