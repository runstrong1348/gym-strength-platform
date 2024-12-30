const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to generate dates for workouts
function generateWorkoutDates(config) {
  const workoutDates = [];
  const startDate = new Date(config.startDate);
  const totalWorkouts = config.programLength * config.daysPerWeek;
  
  // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  
  // Convert workout days to numbers and sort them
  const workoutDayNumbers = config.workoutDays
    .map(day => dayMap[day.toLowerCase()])
    .sort((a, b) => a - b);

  let currentDate = new Date(startDate);
  let workoutsCreated = 0;

  while (workoutsCreated < totalWorkouts) {
    if (workoutDayNumbers.includes(currentDate.getDay())) {
      workoutDates.push(new Date(currentDate));
      workoutsCreated++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workoutDates;
}

app.post('/api/generate-program', async (req, res) => {
  try {
    const config = req.body;
    console.log('Received config:', config);

    // Generate a sample program structure if OpenAI fails
    const fallbackProgram = {
      workouts: Array(config.programLength * config.daysPerWeek).fill(null).map((_, index) => ({
        id: uuidv4(),
        name: `Workout ${index + 1}`,
        focus: 'Strength and Conditioning',
        warmup: [
          {
            name: 'Dynamic Stretching',
            sets: 1,
            reps: 10,
            notes: 'Full body warm-up'
          }
        ],
        supersets: [
          {
            name: 'Main Workout',
            exercises: [
              {
                name: 'Squats',
                sets: 3,
                reps: 10,
                restBetweenSets: 90
              },
              {
                name: 'Push-ups',
                sets: 3,
                reps: 12,
                restBetweenSets: 60
              }
            ]
          }
        ],
        cooldown: [
          {
            name: 'Static Stretching',
            sets: 1,
            reps: 5,
            notes: 'Hold each stretch for 30 seconds'
          }
        ]
      }))
    };

    // Generate workout dates
    const workoutDates = generateWorkoutDates(config);
    console.log('Generated workout dates:', workoutDates);

    try {
      const prompt = `As an expert strength and conditioning coach, create a detailed training program with the following requirements:

Client Details:
- Name: ${config.clientName}
- Experience Level: ${config.experienceLevel}
- Primary Goal: ${config.goal}
- Race Type: ${config.raceType}
- Race Date: ${config.raceDate}
- Days per Week: ${config.daysPerWeek}
- Program Length: ${config.programLength} weeks
- Start Date: ${config.startDate}
- Preferred Workout Days: ${config.workoutDays.join(', ')}
${config.injury ? `- Injury Consideration: ${config.injury.type} (${config.injury.severity})` : ''}

Create a program with exactly ${config.programLength * config.daysPerWeek} workouts.
Each workout must include:
1. A warmup section with at least 1 exercise
2. 1-3 supersets with 2-4 exercises each
3. A cooldown section with at least 1 exercise

Each exercise must specify:
- name (string)
- sets (number)
- reps (number)
- restBetweenSets (number, in seconds)
- notes (optional string)

Response must be a valid JSON object with this exact structure:
{
  "workouts": [
    {
      "name": "string",
      "focus": "string",
      "warmup": [Exercise],
      "supersets": [
        {
          "name": "string",
          "exercises": [Exercise]
        }
      ],
      "cooldown": [Exercise]
    }
  ]
}`;

      console.log('Sending prompt to OpenAI');
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert strength and conditioning coach. Respond only with valid JSON matching the specified structure exactly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      console.log('Received response from OpenAI');
      const program = JSON.parse(response.choices[0].message.content || '{}');
      
      // Use OpenAI response if valid, otherwise use fallback
      const workouts = (program.workouts && Array.isArray(program.workouts) && program.workouts.length > 0)
        ? program.workouts
        : fallbackProgram.workouts;

      // Combine workout data with dates
      const completeWorkouts = workouts.map((workout, index) => ({
        ...workout,
        id: uuidv4(),
        date: workoutDates[index].toISOString(),
        week: Math.floor(index / config.daysPerWeek) + 1,
        day: (index % config.daysPerWeek) + 1
      }));

      // Create the complete program
      const completeProgram = {
        id: uuidv4(),
        clientId: config.clientId,
        config,
        workouts: completeWorkouts,
        completedWorkouts: [],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      console.log('Generated program:', completeProgram);
      res.json(completeProgram);
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      
      // Use fallback program if OpenAI fails
      const completeWorkouts = fallbackProgram.workouts.map((workout, index) => ({
        ...workout,
        id: uuidv4(),
        date: workoutDates[index].toISOString(),
        week: Math.floor(index / config.daysPerWeek) + 1,
        day: (index % config.daysPerWeek) + 1
      }));

      const fallbackCompleteProgram = {
        id: uuidv4(),
        clientId: config.clientId,
        config,
        workouts: completeWorkouts,
        completedWorkouts: [],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      console.log('Using fallback program:', fallbackCompleteProgram);
      res.json(fallbackCompleteProgram);
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
