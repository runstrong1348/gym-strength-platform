import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
  Text,
  useToast,
  Checkbox,
  SimpleGrid,
  HStack,
} from '@chakra-ui/react';
import { v4 as uuidv4 } from 'uuid';
import { generateProgram } from '../services/openai';
import type { Program, ProgramConfig, DayOfWeek } from '../types/program';
import type { ClientData } from '../types/client';

const INJURY_TYPES = ["knee", "ankle", "hip"];
const INJURY_SEVERITIES = ["mild", "moderate", "severe"];

const ProgramBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState<ClientData | null>(null);
  const [config, setConfig] = useState<Partial<ProgramConfig>>({
    daysPerWeek: 3,
    raceType: '',
    startDate: '',
    raceDate: '',
    clientId: crypto.randomUUID(), // Generate a client ID upfront
  });
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [injuryType, setInjuryType] = useState<string>('');
  const [injurySeverity, setInjurySeverity] = useState<string>('');

  const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    // Check for client ID in URL params
    const params = new URLSearchParams(location.search);
    const clientId = params.get('clientId');
    
    if (clientId) {
      const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
      const foundClient = savedClients.find((c: ClientData) => c.id === clientId);
      if (foundClient) {
        setClient(foundClient);
        setConfig(prev => ({
          ...prev,
          clientName: foundClient.name,
          clientId: foundClient.id,
        }));
      } else {
        // If client not found, create new client ID
        setConfig(prev => ({
          ...prev,
          clientId: crypto.randomUUID(),
        }));
      }
    }
  }, [location]);

  const handleDaySelect = (day: DayOfWeek) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      }
      if (prev.length < config.daysPerWeek!) {
        return [...prev, day];
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!config.clientName || !config.startDate || !config.raceDate || selectedDays.length === 0) {
        throw new Error('Please fill in all required fields and select workout days');
      }

      if (selectedDays.length !== config.daysPerWeek) {
        throw new Error(`Please select exactly ${config.daysPerWeek} workout days`);
      }

      const startDate = new Date(config.startDate);
      const raceDate = new Date(config.raceDate);
      
      if (startDate >= raceDate) {
        throw new Error('Start date must be before race date');
      }

      const weeksDiff = Math.ceil((raceDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (weeksDiff < 4) {
        throw new Error('Program must be at least 4 weeks long');
      }

      const fullConfig: ProgramConfig = {
        clientId: config.clientId!,
        clientName: config.clientName!,
        experienceLevel: 'beginner',
        goal: 'complete race',
        raceType: config.raceType!,
        raceDate: config.raceDate!,
        daysPerWeek: config.daysPerWeek!,
        programLength: weeksDiff,
        startDate: config.startDate!,
        workoutDays: selectedDays,
        injury: injuryType && injurySeverity ? {
          type: injuryType,
          severity: injurySeverity as 'mild' | 'moderate' | 'severe'
        } : undefined
      };

      // Generate the program using OpenAI
      const program = await generateProgram(fullConfig);

      // Create or update client in localStorage
      const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
      if (client) {
        // Update existing client
        const updatedClients = savedClients.map((c: ClientData) => {
          if (c.id === client.id) {
            return {
              ...c,
              programs: [...(c.programs || []), program.id],
              activeProgram: program.id,
              lastUpdated: new Date().toISOString(),
            };
          }
          return c;
        });
        localStorage.setItem('clients', JSON.stringify(updatedClients));
      } else {
        // Create new client
        const newClient: ClientData = {
          id: config.clientId!,
          name: config.clientName!,
          email: '',
          dateCreated: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          goals: [],
          injuries: [],
          movementMaxes: {},
          workoutLogs: [],
          weeklyProgress: [],
          notes: '',
          activeProgram: program.id,
          programs: [program.id],
          metrics: {
            totalWorkoutsCompleted: 0,
            averageWorkoutRating: 0,
            consistencyScore: 0,
            currentStreak: 0,
            longestStreak: 0
          }
        };
        localStorage.setItem('clients', JSON.stringify([...savedClients, newClient]));
      }

      // Save program to localStorage
      const existingPrograms = JSON.parse(localStorage.getItem('programs') || '[]');
      localStorage.setItem('programs', JSON.stringify([...existingPrograms, program]));

      toast({
        title: 'Program Created',
        description: client 
          ? 'New program added to client profile'
          : 'Program created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate based on context
      navigate(`/client/${config.clientId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create program',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="800px" mx="auto" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">
          {client ? `Create New Program for ${client.name}` : 'Create New Program'}
        </Heading>

        <FormControl isRequired>
          <FormLabel>Client Name</FormLabel>
          <Input
            value={config.clientName || ''}
            onChange={(e) => setConfig({ ...config, clientName: e.target.value })}
            placeholder="Enter client name"
            isDisabled={!!client}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Race Type</FormLabel>
          <Select
            value={config.raceType}
            onChange={(e) => setConfig({ ...config, raceType: e.target.value })}
            placeholder="Select race type"
          >
            <option value="5k">5K</option>
            <option value="10k">10K</option>
            <option value="half_marathon">Half Marathon</option>
            <option value="marathon">Marathon</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Injury Considerations</FormLabel>
          <VStack spacing={4} align="stretch">
            <Select
              value={injuryType}
              onChange={(e) => {
                setInjuryType(e.target.value);
                if (!e.target.value) {
                  setInjurySeverity('');
                }
              }}
              placeholder="Select injury type (optional)"
            >
              {INJURY_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>
            {injuryType && (
              <Select
                value={injurySeverity}
                onChange={(e) => setInjurySeverity(e.target.value)}
                placeholder="Select injury severity"
                isRequired={!!injuryType}
              >
                {INJURY_SEVERITIES.map(severity => (
                  <option key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </option>
                ))}
              </Select>
            )}
          </VStack>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Days per Week</FormLabel>
          <NumberInput
            min={2}
            max={6}
            value={config.daysPerWeek}
            onChange={(_, value) => {
              setConfig({ ...config, daysPerWeek: value });
              setSelectedDays([]);
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Select Workout Days</FormLabel>
          <SimpleGrid columns={[2, 3, 4]} spacing={4}>
            {daysOfWeek.map((day) => (
              <Checkbox
                key={day}
                isChecked={selectedDays.includes(day)}
                onChange={() => handleDaySelect(day)}
                isDisabled={!selectedDays.includes(day) && selectedDays.length >= config.daysPerWeek!}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Checkbox>
            ))}
          </SimpleGrid>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Start Date</FormLabel>
          <Input
            type="date"
            value={config.startDate}
            onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Race Date</FormLabel>
          <Input
            type="date"
            value={config.raceDate}
            onChange={(e) => setConfig({ ...config, raceDate: e.target.value })}
          />
        </FormControl>

        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Creating Program..."
          >
            Create Program
          </Button>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProgramBuilder;
