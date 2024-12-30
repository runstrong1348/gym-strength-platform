import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Image,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Input,
  List,
  ListItem,
  Avatar,
  HStack,
  Badge,
  Spacer,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaDumbbell, FaUsersCog, FaSearch } from 'react-icons/fa';

interface HomeProps {
  onWeightRoomOpen: () => void;
}

interface Client {
  id: string;
  name: string;
  dateCreated: string;
  lastUpdated: string;
  goals: string[];
  injuries: string[];
  movementMaxes: Record<string, number>;
  notes: string;
  programs: string[];
  activeProgram: string | null;
  metrics?: {
    totalWorkoutsCompleted: number;
    averageWorkoutRating: number;
    consistencyScore: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export const Home: React.FC<HomeProps> = ({ onWeightRoomOpen }) => {
  const navigate = useNavigate();
  const bgGradient = useColorModeValue(
    'linear(to-b, gray.100, white)',
    'linear(to-b, gray.900, gray.800)'
  );
  const searchBg = useColorModeValue('white', 'gray.800');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  // Sample client data for initial setup
  const sampleClients: Client[] = [
    {
      id: crypto.randomUUID(),
      name: 'John Smith',
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      goals: ['Build strength', 'Improve endurance'],
      injuries: [],
      movementMaxes: {},
      notes: '',
      programs: [],
      activeProgram: null,
      metrics: {
        totalWorkoutsCompleted: 12,
        averageWorkoutRating: 4.5,
        consistencyScore: 90,
        currentStreak: 3,
        longestStreak: 5
      }
    },
    {
      id: crypto.randomUUID(),
      name: 'Jane Doe',
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      goals: ['Marathon training'],
      injuries: [],
      movementMaxes: {},
      notes: '',
      programs: [],
      activeProgram: null,
      metrics: {
        totalWorkoutsCompleted: 8,
        averageWorkoutRating: 4.2,
        consistencyScore: 85,
        currentStreak: 2,
        longestStreak: 4
      }
    },
    {
      id: crypto.randomUUID(),
      name: 'Mike Johnson',
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      goals: ['Recovery', 'Injury prevention'],
      injuries: ['Previous knee injury'],
      movementMaxes: {},
      notes: '',
      programs: [],
      activeProgram: null,
      metrics: {
        totalWorkoutsCompleted: 4,
        averageWorkoutRating: 4.0,
        consistencyScore: 75,
        currentStreak: 1,
        longestStreak: 3
      }
    }
  ];

  // Load clients from localStorage
  useEffect(() => {
    const loadClients = () => {
      const savedClients = localStorage.getItem('clients');
      console.log('Loading clients from localStorage:', savedClients);
      
      if (savedClients) {
        const parsedClients = JSON.parse(savedClients);
        console.log('Parsed clients:', parsedClients);
        setClients(parsedClients);
      } else {
        // Initialize with sample clients if no clients exist
        console.log('No clients found, initializing with sample clients:', sampleClients);
        localStorage.setItem('clients', JSON.stringify(sampleClients));
        setClients(sampleClients);
      }
    };

    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Filtered clients:', filteredClients);

  return (
    <Box bgGradient={bgGradient} minH="100vh">
      <Container maxW="container.xl" pt={8}>
        {/* Logo Section */}
        <VStack spacing={8} mb={16} textAlign="center">
          <Image
            src="/logo.png"
            alt="Strength Platform Logo"
            maxW="400px"
            w="100%"
            mb={4}
          />
          <Text fontSize="xl" color="gray.500">
            Your Personal Strength Training Companion
          </Text>
        </VStack>

        {/* Search Section */}
        <Box
          position="relative"
          maxW="600px"
          mx="auto"
          mb={16}
        >
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              bg={searchBg}
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(e.target.value !== '');
              }}
              borderRadius="full"
              boxShadow="lg"
              _focus={{
                boxShadow: 'xl',
                borderColor: 'brand.500',
              }}
            />
          </InputGroup>

          {/* Search Results Dropdown */}
          {isSearching && filteredClients.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              mt={2}
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="md"
              boxShadow="xl"
              zIndex={10}
              maxH="300px"
              overflowY="auto"
            >
              {filteredClients.map(client => (
                <Box
                  key={client.id}
                  p={3}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                  cursor="pointer"
                  onClick={() => {
                    navigate(`/client/${client.id}`);
                    setSearchQuery('');
                    setIsSearching(false);
                  }}
                >
                  <HStack>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{client.name}</Text>
                      {client.goals.length > 0 && (
                        <Text fontSize="sm" color="gray.500">
                          {client.goals[0]}
                        </Text>
                      )}
                    </VStack>
                    <Spacer />
                    <Badge colorScheme={client.activeProgram ? 'green' : 'gray'}>
                      {client.activeProgram ? 'Active Program' : 'No Program'}
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Feature Cards - Show only when not searching */}
        {!isSearching && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mb={16}>
            <FeatureCard
              icon={<FaUserPlus size="2em" />}
              title="Add New Client"
              description="Create a new client profile and design their personalized training program."
              to="/add-client"
            />
            <FeatureCard
              icon={<FaDumbbell size="2em" />}
              title="Weight Room"
              description="Execute and track client workouts in real-time with video demonstrations."
              onClick={onWeightRoomOpen}
            />
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to?: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, to, onClick }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <VStack
      as={to ? Link : 'div'}
      to={to}
      p={8}
      bg={cardBg}
      _hover={{ bg: cardHoverBg, transform: 'translateY(-5px)' }}
      borderRadius="xl"
      boxShadow="xl"
      transition="all 0.3s"
      spacing={4}
      align="center"
      cursor="pointer"
      onClick={handleClick}
    >
      <Box color="brand.500">
        {icon}
      </Box>
      <Heading size="md">{title}</Heading>
      <Text textAlign="center" color="gray.500">
        {description}
      </Text>
    </VStack>
  );
};
