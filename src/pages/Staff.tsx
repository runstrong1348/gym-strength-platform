import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Avatar,
  HStack,
  Divider,
  List,
  ListItem,
} from '@chakra-ui/react';
import { FaEdit, FaSave } from 'react-icons/fa';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

interface Workout {
  name: string;
  exercises: Exercise[];
}

interface ActiveClient {
  id: string;
  name: string;
  currentWorkout: Workout;
  startTime: string;
  notes: string[];
}

export const Staff: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const listItemBg = useColorModeValue('gray.50', 'gray.700');
  const listItemHoverBg = useColorModeValue('gray.100', 'gray.600');

  const [selectedClient, setSelectedClient] = useState<ActiveClient | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (selectedClient && newNote.trim()) {
      selectedClient.notes.push(newNote.trim());
      setNewNote('');
      setIsEditingNotes(false);
    }
  };

  // Sample data - replace with real data later
  const activeClients: ActiveClient[] = [
    {
      id: '1',
      name: 'John Smith',
      currentWorkout: {
        name: 'Lower Body Strength',
        exercises: [
          { id: '1', name: 'Squats', sets: 4, reps: 8, weight: 225 },
          { id: '2', name: 'Romanian Deadlifts', sets: 3, reps: 12, weight: 185 },
          { id: '3', name: 'Leg Press', sets: 3, reps: 15, weight: 360 },
        ],
      },
      startTime: '10:30 AM',
      notes: ['Form looking good on squats', 'Increase weight next session'],
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      currentWorkout: {
        name: 'Upper Body Power',
        exercises: [
          { id: '1', name: 'Bench Press', sets: 5, reps: 5, weight: 135 },
          { id: '2', name: 'Pull-ups', sets: 4, reps: 8 },
          { id: '3', name: 'Shoulder Press', sets: 3, reps: 10, weight: 85 },
        ],
      },
      startTime: '10:45 AM',
      notes: ['Working on pull-up form'],
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="xl">Active Clients</Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {activeClients.map((client) => (
            <Box
              key={client.id}
              bg={bgColor}
              p={6}
              borderRadius="xl"
              boxShadow="lg"
              cursor="pointer"
              onClick={() => setSelectedClient(client)}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.2s"
            >
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Avatar name={client.name} size="md" />
                  <Box flex={1}>
                    <Heading size="md">{client.name}</Heading>
                    <Text color="gray.500">Started at {client.startTime}</Text>
                  </Box>
                </HStack>

                <Box>
                  <Text fontWeight="bold" color="brand.500">
                    {client.currentWorkout.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {client.currentWorkout.exercises.length} exercises
                  </Text>
                </Box>

                <Badge colorScheme="green" alignSelf="flex-start">
                  In Progress
                </Badge>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      {/* Client Workout Modal */}
      <Modal
        isOpen={!!selectedClient}
        onClose={() => {
          setSelectedClient(null);
          setIsEditingNotes(false);
        }}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedClient?.name} - {selectedClient?.currentWorkout.name}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack align="stretch" spacing={6}>
              {/* Exercise List */}
              <Box>
                <Heading size="sm" mb={3}>
                  Exercises
                </Heading>
                <List spacing={3}>
                  {selectedClient?.currentWorkout.exercises.map((exercise) => (
                    <ListItem
                      key={exercise.id}
                      p={3}
                      bg={listItemBg}
                      borderRadius="md"
                      _hover={{ bg: listItemHoverBg }}
                    >
                      <Text fontWeight="bold">{exercise.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.weight && ` @ ${exercise.weight} lbs`}
                      </Text>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Divider />

              {/* Notes Section */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm">Notes</Heading>
                  <Button
                    size="sm"
                    leftIcon={isEditingNotes ? <FaSave /> : <FaEdit />}
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                  >
                    {isEditingNotes ? 'Save' : 'Add Note'}
                  </Button>
                </HStack>

                {isEditingNotes ? (
                  <VStack align="stretch" spacing={3}>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about the client's progress..."
                    />
                    <Button colorScheme="blue" onClick={handleAddNote}>
                      Add Note
                    </Button>
                  </VStack>
                ) : (
                  <List spacing={2}>
                    {selectedClient?.notes.map((note, index) => (
                      <ListItem key={index} fontSize="sm">
                        • {note}
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => setSelectedClient(null)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
