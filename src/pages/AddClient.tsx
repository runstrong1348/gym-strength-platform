import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Text,
  Textarea,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Client } from '../types/client';

export const AddClient: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goals: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new client object
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: formData.name,
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      goals: formData.goals.split(',').map(goal => goal.trim()).filter(Boolean),
      injuries: [],
      movementMaxes: {},
      notes: formData.notes,
      programs: [],
      activeProgram: null,
      metrics: {
        totalWorkoutsCompleted: 0,
        averageWorkoutRating: 0,
        consistencyScore: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    };

    // Get existing clients
    const existingClients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    // Add new client
    const updatedClients = [...existingClients, newClient];
    localStorage.setItem('clients', JSON.stringify(updatedClients));

    // Show success message
    toast({
      title: 'Client Added',
      description: `Successfully added ${newClient.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Navigate to client's profile
    navigate(`/client/${newClient.id}`);
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.md" pt={8}>
        <VStack spacing={8} align="stretch">
          {/* Logo */}
          <VStack spacing={4} textAlign="center">
            <Image
              src="/logo.png"
              alt="Strength Platform Logo"
              maxW="300px"
              mx="auto"
            />
            <Heading size="lg">Add New Client</Heading>
            <Text color="gray.500">
              Create a new client profile and start their strength journey
            </Text>
          </VStack>

          {/* Form */}
          <Box
            as="form"
            onSubmit={handleSubmit}
            bg={useColorModeValue('white', 'gray.800')}
            p={8}
            borderRadius="xl"
            boxShadow="xl"
          >
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter client's name"
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter client's email"
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Goals (comma-separated)</FormLabel>
                <Input
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="e.g., Build strength, Improve endurance, Marathon training"
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes about the client"
                  size="lg"
                  rows={4}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                mt={4}
              >
                Add Client
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
