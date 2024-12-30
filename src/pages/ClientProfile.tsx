import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Grid,
  Flex,
  Icon,
  useToast,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Center,
  Container,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronDownIcon, AddIcon } from '@chakra-ui/icons';
import { FaDumbbell, FaCheckCircle, FaPlus } from 'react-icons/fa';
import type { Program } from '../types/program';
import type { ClientData } from '../types/client';

interface ClientProfileProps {
  onWeightRoomOpen: (clientId: string) => void;
}

const ClientProfile = ({ onWeightRoomOpen }: ClientProfileProps) => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [client, setClient] = useState<ClientData | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      console.error('No client ID provided');
      return;
    }

    // Load client data
    const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    console.log('All saved clients:', savedClients);
    console.log('Looking for client with ID:', clientId);
    
    const clientData = savedClients.find((c: ClientData) => {
      console.log('Comparing client ID:', c.id, 'with:', clientId);
      return c.id === clientId;
    });
    
    if (clientData) {
      console.log('Found client:', clientData);
      setClient(clientData);
      
      // Load all programs for this client
      const savedPrograms = JSON.parse(localStorage.getItem('programs') || '[]');
      console.log('All saved programs:', savedPrograms);
      
      const clientPrograms = savedPrograms.filter((p: Program) => {
        const isIncluded = clientData.programs.includes(p.id);
        console.log('Program:', p.id, 'included:', isIncluded);
        return isIncluded;
      });
      
      console.log('Client programs:', clientPrograms);
      setPrograms(clientPrograms);
      
      // Set active program
      if (clientData.activeProgram) {
        const active = clientPrograms.find(p => p.id === clientData.activeProgram);
        console.log('Active program:', active);
        if (active) {
          setActiveProgram(active);
        }
      }
    } else {
      console.error('Client not found. All clients:', savedClients);
      toast({
        title: 'Error',
        description: 'Client not found',
        status: 'error',
        duration: 3000,
      });
    }
  }, [clientId, toast]);

  const handleSetActiveProgram = (programId: string) => {
    if (!client) return;

    console.log('Setting active program:', programId);

    // Update client's active program
    const updatedClient = {
      ...client,
      activeProgram: programId,
      lastUpdated: new Date().toISOString(),
    };

    // Update localStorage
    const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    const updatedClients = savedClients.map((c: ClientData) =>
      c.id === client.id ? updatedClient : c
    );
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    console.log('Updated clients in localStorage:', updatedClients);

    // Update state
    setClient(updatedClient);
    const newActiveProgram = programs.find(p => p.id === programId);
    console.log('New active program:', newActiveProgram);
    if (newActiveProgram) {
      setActiveProgram(newActiveProgram);
    }

    toast({
      title: 'Program Activated',
      description: 'The selected program is now active',
      status: 'success',
      duration: 3000,
    });
  };

  const handleCreateProgram = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!client) {
        throw new Error('No client selected');
      }

      // Sample config for testing - replace with form data later
      const programConfig = {
        clientId: client.id,
        clientName: client.name,
        experienceLevel: "intermediate",
        goal: client.goals[0] || "general fitness",
        raceType: "none",
        raceDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
        daysPerWeek: 4,
        programLength: 12,
        startDate: new Date().toISOString(),
        workoutDays: ["monday", "tuesday", "thursday", "friday"]
      };

      console.log('Generating program with config:', programConfig);
      const program = await generateProgram(programConfig);
      console.log('Generated program:', program);

      if (!program) {
        throw new Error('Failed to generate program');
      }

      // Save the program
      const savedPrograms = JSON.parse(localStorage.getItem('programs') || '[]');
      savedPrograms.push(program);
      localStorage.setItem('programs', JSON.stringify(savedPrograms));

      // Update client's programs and active program
      const updatedClient = {
        ...client,
        programs: [...client.programs, program.id],
        activeProgram: program.id
      };

      // Update client in localStorage
      const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
      const clientIndex = savedClients.findIndex((c: ClientData) => c.id === client.id);
      if (clientIndex !== -1) {
        savedClients[clientIndex] = updatedClient;
        localStorage.setItem('clients', JSON.stringify(savedClients));
      }

      // Update local state
      setClient(updatedClient);
      setPrograms([...programs, program]);
      setActiveProgram(program);

      toast({
        title: 'Program Created',
        description: 'New program has been created and set as active',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error creating program:', error);
      setError(error instanceof Error ? error.message : 'Failed to create program');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create program',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewProgram = () => {
    // Navigate to program builder with client context
    navigate(`/program/new?clientId=${clientId}`);
  };

  const handleOpenWeightRoom = () => {
    console.log('Opening weight room for client:', client);
    console.log('Active program:', activeProgram);

    if (!client) {
      console.error('No client found');
      toast({
        title: 'Error',
        description: 'Client not found',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!activeProgram) {
      console.error('No active program found');
      toast({
        title: 'No Active Program',
        description: 'Please select or create a program first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Save the client and active program to localStorage
    const updatedClient = {
      ...client,
      activeProgram: activeProgram.id,
      lastUpdated: new Date().toISOString(),
    };

    const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    const updatedClients = savedClients.map((c: ClientData) =>
      c.id === client.id ? updatedClient : c
    );
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    console.log('Updated clients in localStorage:', updatedClients);

    localStorage.setItem('currentProgram', JSON.stringify(activeProgram));
    console.log('Saved active program to localStorage:', activeProgram);
    
    // Open the weight room with client ID
    onWeightRoomOpen(client.id);
  };

  if (!client) {
    return (
      <VStack spacing={4} p={8} align="center">
        <Icon as={ChevronLeftIcon} w={8} h={8} onClick={() => navigate('/clients')} cursor="pointer" />
        <Text>Client not found</Text>
      </VStack>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        {loading ? (
          <Center p={8}>
            <Spinner size="xl" />
          </Center>
        ) : error ? (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <VStack spacing={8} align="stretch">
            {/* Client Header */}
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="xl">{client.name}</Heading>
                <Text color="gray.500">
                  Member since {new Date(client.dateCreated).toLocaleDateString()}
                </Text>
              </VStack>
              <Button
                leftIcon={<FaDumbbell />}
                colorScheme="blue"
                onClick={() => onWeightRoomOpen(client.id)}
                isDisabled={!client.activeProgram}
              >
                Open Weight Room
              </Button>
            </HStack>

            {/* Client Info */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Left Column */}
              <VStack align="stretch" spacing={6}>
                {/* Goals */}
                <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
                  <Heading size="md" mb={4}>Goals</Heading>
                  {client.goals.length > 0 ? (
                    <List spacing={2}>
                      {client.goals.map((goal, index) => (
                        <ListItem key={index}>
                          <ListIcon as={FaCheckCircle} color="green.500" />
                          {goal}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Text color="gray.500">No goals set</Text>
                  )}
                </Box>

                {/* Notes */}
                <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
                  <Heading size="md" mb={4}>Notes</Heading>
                  <Text>{client.notes || 'No notes'}</Text>
                </Box>
              </VStack>

              {/* Right Column - Programs */}
              <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Programs</Heading>
                  <Button
                    leftIcon={<FaPlus />}
                    colorScheme="blue"
                    onClick={handleCreateProgram}
                    isLoading={loading}
                  >
                    Create Program
                  </Button>
                </HStack>

                {programs.length > 0 ? (
                  <VStack align="stretch" spacing={4}>
                    {programs.map((program) => (
                      <Box
                        key={program.id}
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        borderColor={program.id === client.activeProgram ? 'blue.500' : 'gray.200'}
                        _hover={{ borderColor: 'blue.500' }}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{program.name || 'Untitled Program'}</Text>
                            <Text fontSize="sm" color="gray.500">
                              Created {new Date(program.startDate).toLocaleDateString()}
                            </Text>
                          </VStack>
                          <Button
                            size="sm"
                            variant={program.id === client.activeProgram ? 'solid' : 'outline'}
                            colorScheme="blue"
                            onClick={() => setActiveProgram(program)}
                          >
                            {program.id === client.activeProgram ? 'Active' : 'Set Active'}
                          </Button>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">No programs yet</Text>
                )}
              </Box>
            </SimpleGrid>
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default ClientProfile;
