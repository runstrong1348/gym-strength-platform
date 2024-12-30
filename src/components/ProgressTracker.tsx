import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ClientData, WorkoutLog, WeeklyProgress } from '../types/client';
import type { Program } from '../types/program';

interface ProgressTrackerProps {
  client: ClientData;
  program: Program;
  onProgressUpdate: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  client,
  program,
  onProgressUpdate,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [newWorkoutLog, setNewWorkoutLog] = useState<Partial<WorkoutLog>>({
    feelingRating: 3,
    sleepQuality: 3,
    stressLevel: 3,
  });

  // Calculate current week's progress
  const getCurrentWeekProgress = () => {
    const today = new Date();
    const startDate = new Date(program.config.startDate);
    const weekNumber = Math.floor(
      (today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ) + 1;

    const weekLogs = client?.workoutLogs?.filter(
      log => log.programId === program.id && log.week === weekNumber
    ) || [];

    const weekProgress = client?.weeklyProgress?.find(
      wp => wp.programId === program.id && wp.week === weekNumber
    );

    return {
      weekNumber,
      completedWorkouts: weekLogs.length,
      totalWorkouts: program.config.daysPerWeek,
      averageRating: weekLogs.length > 0 
        ? weekLogs.reduce((acc, log) => acc + (log.feelingRating || 0), 0) / weekLogs.length 
        : 0,
      weekProgress,
    };
  };

  const handleLogWorkout = () => {
    if (!selectedWorkout) return;

    const newLog: WorkoutLog = {
      ...newWorkoutLog as WorkoutLog,
      date: new Date().toISOString(),
      programId: program.id,
      week: selectedWorkout.week,
      day: selectedWorkout.day,
      exercises: selectedWorkout.supersets.flatMap((ss: any) =>
        ss.exercises.map((ex: any) => ({
          name: ex.name,
          sets: ex.sets.map((set: any) => ({
            weight: set.weight || 0,
            reps: set.reps || 0,
            rpe: set.rpe,
            notes: set.notes,
          })),
        }))
      ),
    };

    // Update client data
    const updatedClient = {
      ...client,
      workoutLogs: [...client.workoutLogs, newLog],
      metrics: {
        ...client.metrics,
        totalWorkoutsCompleted: client.metrics.totalWorkoutsCompleted + 1,
        averageWorkoutRating:
          (client.metrics.averageWorkoutRating * client.metrics.totalWorkoutsCompleted +
            newLog.feelingRating) /
          (client.metrics.totalWorkoutsCompleted + 1),
        consistencyScore:
          ((client.metrics.totalWorkoutsCompleted + 1) /
            (getCurrentWeekProgress().weekNumber * program.config.daysPerWeek)) *
          100,
      },
    };

    // Update localStorage
    const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    const updatedClients = savedClients.map((c: ClientData) =>
      c.id === client.id ? updatedClient : c
    );
    localStorage.setItem('clients', JSON.stringify(updatedClients));

    onProgressUpdate();
    onClose();
  };

  const renderProgressChart = () => {
    // Handle case where workoutLogs is undefined
    if (!client?.workoutLogs) {
      return (
        <Box h="400px" w="100%" display="flex" alignItems="center" justifyContent="center">
          <Text color="gray.500">No workout data available</Text>
        </Box>
      );
    }

    const data = client.workoutLogs
      .filter(log => log.programId === program.id)
      .map(log => ({
        date: new Date(log.date).toLocaleDateString(),
        feeling: log.feelingRating || 0,
        sleep: log.sleepQuality || 0,
        stress: log.stressLevel || 0,
        bodyweight: log.bodyweight,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (data.length === 0) {
      return (
        <Box h="400px" w="100%" display="flex" alignItems="center" justifyContent="center">
          <Text color="gray.500">No workout data available for this program</Text>
        </Box>
      );
    }

    return (
      <Box h="400px" w="100%">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="feeling" stroke="#8884d8" name="Feeling" />
            <Line type="monotone" dataKey="sleep" stroke="#82ca9d" name="Sleep" />
            <Line type="monotone" dataKey="stress" stroke="#ffc658" name="Stress" />
            {data.some(d => d.bodyweight) && (
              <Line type="monotone" dataKey="bodyweight" stroke="#ff7300" name="Weight" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <Box>
      <Tabs>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Workouts</Tab>
          <Tab>Weekly Progress</Tab>
          <Tab>Movement Tracking</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={[1, 2, 4]} spacing={4}>
                <Stat>
                  <StatLabel>Program Progress</StatLabel>
                  <StatNumber>
                    {Math.round(
                      ((client?.metrics?.totalWorkoutsCompleted || 0) /
                        (program.workouts.length * program.config.daysPerWeek)) *
                        100
                    )}
                    %
                  </StatNumber>
                  <StatHelpText>
                    {client?.metrics?.totalWorkoutsCompleted || 0} / {program.workouts.length}{' '}
                    workouts completed
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Current Streak</StatLabel>
                  <StatNumber>{client?.metrics?.currentStreak || 0}</StatNumber>
                  <StatHelpText>Consecutive workouts</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Consistency Score</StatLabel>
                  <StatNumber>
                    {Math.round(client?.metrics?.consistencyScore || 0)}%
                  </StatNumber>
                  <StatHelpText>Of scheduled workouts</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Average Rating</StatLabel>
                  <StatNumber>
                    {(client?.metrics?.averageWorkoutRating || 0).toFixed(1)}
                  </StatNumber>
                  <StatHelpText>Out of 5</StatHelpText>
                </Stat>
              </SimpleGrid>

              {renderProgressChart()}
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              {program.workouts.map((workout, index) => {
                const log = client?.workoutLogs?.find(
                  l =>
                    l.programId === program.id &&
                    l.week === workout.week &&
                    l.day === workout.day
                );

                return (
                  <Box
                    key={index}
                    p={4}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={log ? 'green.500' : 'gray.500'}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">
                          Week {workout.week}, Day {workout.day}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {workout.focus}
                        </Text>
                      </VStack>
                      {log ? (
                        <VStack align="end" spacing={1}>
                          <Text color="green.500">Completed</Text>
                          <Text fontSize="sm">
                            Rating: {log.feelingRating || 0}/5
                          </Text>
                        </VStack>
                      ) : (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => {
                            setSelectedWorkout(workout);
                            onOpen();
                          }}
                        >
                          Log Workout
                        </Button>
                      )}
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={6} align="stretch">
              {!client?.weeklyProgress ? (
                <Box p={4} borderRadius="md" borderWidth="1px" borderColor="gray.200">
                  <Text color="gray.500" textAlign="center">No weekly progress data available</Text>
                </Box>
              ) : client.weeklyProgress
                  .filter(wp => wp.programId === program.id)
                  .map(week => (
                    <Box
                      key={week.week}
                      p={4}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.500"
                    >
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">Week {week.week}</Heading>
                        <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                          <Box>
                            <Text fontWeight="bold">Workouts Completed</Text>
                            <Text>
                              {week.metrics?.completedWorkouts || 0} /{' '}
                              {week.metrics?.totalWorkouts || 0}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Average Rating</Text>
                            <Text>{(week.metrics?.averageWorkoutRating || 0).toFixed(1)}/5</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Sleep Quality</Text>
                            <Text>{(week.metrics?.averageSleepQuality || 0).toFixed(1)}/5</Text>
                          </Box>
                        </SimpleGrid>
                        <Box>
                          <Text fontWeight="bold">Goals</Text>
                          <Text>Achieved: {week.goals?.achieved?.join(', ') || 'None'}</Text>
                          <Text>In Progress: {week.goals?.inProgress?.join(', ') || 'None'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Notes</Text>
                          <Text>{week.notes || 'No notes'}</Text>
                        </Box>
                      </VStack>
                    </Box>
                  ))}
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={6} align="stretch">
              {!client?.movementMaxes ? (
                <Box p={4} borderRadius="md" borderWidth="1px" borderColor="gray.200">
                  <Text color="gray.500" textAlign="center">No movement data available</Text>
                </Box>
              ) : Object.entries(client.movementMaxes).map(([movement, maxes]) => (
                <Box
                  key={movement}
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.500"
                >
                  <VStack align="stretch" spacing={4}>
                    <Heading size="md">{movement}</Heading>
                    {!maxes || maxes.length === 0 ? (
                      <Text color="gray.500">No records for this movement</Text>
                    ) : (
                      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                        {maxes
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() - new Date(a.date).getTime()
                          )
                          .map((max, index) => (
                            <Box key={index}>
                              <Text fontWeight="bold">{max.weight} lbs</Text>
                              <Text fontSize="sm">
                                {max.reps && `${max.reps} reps`}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(max.date).toLocaleDateString()}
                              </Text>
                              {max.notes && (
                                <Text fontSize="sm" color="gray.500">
                                  {max.notes}
                                </Text>
                              )}
                            </Box>
                          ))}
                      </SimpleGrid>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Log Workout - Week {selectedWorkout?.week}, Day {selectedWorkout?.day}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>How did you feel?</FormLabel>
                <RadioGroup
                  value={newWorkoutLog.feelingRating?.toString()}
                  onChange={value =>
                    setNewWorkoutLog(prev => ({
                      ...prev,
                      feelingRating: parseInt(value) as 1 | 2 | 3 | 4 | 5,
                    }))
                  }
                >
                  <Stack direction="row">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Radio key={rating} value={rating.toString()}>
                        {rating}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Sleep Quality</FormLabel>
                <RadioGroup
                  value={newWorkoutLog.sleepQuality?.toString()}
                  onChange={value =>
                    setNewWorkoutLog(prev => ({
                      ...prev,
                      sleepQuality: parseInt(value) as 1 | 2 | 3 | 4 | 5,
                    }))
                  }
                >
                  <Stack direction="row">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Radio key={rating} value={rating.toString()}>
                        {rating}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Stress Level</FormLabel>
                <RadioGroup
                  value={newWorkoutLog.stressLevel?.toString()}
                  onChange={value =>
                    setNewWorkoutLog(prev => ({
                      ...prev,
                      stressLevel: parseInt(value) as 1 | 2 | 3 | 4 | 5,
                    }))
                  }
                >
                  <Stack direction="row">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Radio key={rating} value={rating.toString()}>
                        {rating}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Body Weight (optional)</FormLabel>
                <NumberInput
                  value={newWorkoutLog.bodyweight}
                  onChange={(_, value) =>
                    setNewWorkoutLog(prev => ({ ...prev, bodyweight: value }))
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={newWorkoutLog.notes}
                  onChange={e =>
                    setNewWorkoutLog(prev => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="How was the workout? Any challenges or achievements?"
                />
              </FormControl>

              <Button colorScheme="blue" onClick={handleLogWorkout}>
                Save Workout
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProgressTracker;
