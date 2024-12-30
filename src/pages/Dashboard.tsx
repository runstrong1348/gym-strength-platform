import { useState, useEffect } from 'react';
import { Box, Grid, Heading, Text, VStack, useColorModeValue, Button, Flex, Badge } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { Program } from '../types/program';

const Dashboard = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('gray.800', 'gray.800');
  const borderColor = useColorModeValue('gray.700', 'gray.700');
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const savedPrograms = JSON.parse(localStorage.getItem('programs') || '[]');
    setPrograms(savedPrograms);
  }, []);

  return (
    <VStack spacing={8} align="stretch">
      <Flex justify="space-between" align="center">
        <Heading size="lg">Active Clients</Heading>
        <Button 
          colorScheme="blue"
          onClick={() => navigate('/new-program')}
        >
          New Program
        </Button>
      </Flex>
      
      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
        {programs.map((program) => (
          <Box
            key={program.id}
            bg={cardBg}
            p={6}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            cursor="pointer"
            _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
            onClick={() => navigate(`/client/${program.clientId}`)}
            role="button"
            aria-label={`View program for ${program.config.clientName}`}
          >
            <VStack align="stretch" spacing={3}>
              <Heading size="md">{program.config.clientName}</Heading>
              <Badge colorScheme="green" alignSelf="flex-start">
                {program.config.raceType}
              </Badge>
              <Text color="gray.400">
                Race Date: {new Date(program.config.raceDate).toLocaleDateString()}
              </Text>
              <Text color="gray.400">
                Training: {program.config.daysPerWeek} days/week
              </Text>
              {program.config.injury && (
                <Text color="orange.400">
                  Injury: {program.config.injury.type} ({program.config.injury.severity})
                </Text>
              )}
            </VStack>
          </Box>
        ))}
      </Grid>

      {programs.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text color="gray.400">No active programs. Create a new program to get started.</Text>
        </Box>
      )}
    </VStack>
  );
};

export default Dashboard;
