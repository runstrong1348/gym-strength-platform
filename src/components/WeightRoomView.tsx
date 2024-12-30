import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Image,
  IconButton,
  Flex,
  useColorModeValue,
  Center,
  Spinner,
  ScaleFade,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Button,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { SearchIcon } from "@chakra-ui/icons";
import { WeightRoom } from "../pages/WeightRoom";
import { Program, ProgramConfig } from '../types';
import { generateProgram } from '../services/openai';
import { generateUUID } from "../utils/uuid";
import { Logo } from "./Logo";
import { ClientSelector } from './ClientSelector'; // Import ClientSelector

interface WeightRoomViewProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string | null;
}

export const WeightRoomView: React.FC<WeightRoomViewProps> = ({
  isOpen,
  onClose,
  clientId: initialClientId
}) => {
  const [clientId, setClientId] = useState<string | null>(initialClientId || null);
  const [clientName, setClientName] = useState<string>('Sample Client');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClientSelect = (client: any) => {
    console.log('Selected client:', client);
    setClientId(client.id);
    setClientName(client.name);
  };

  const handleGenerateProgram = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Sample config for testing - replace with actual form data later
      const sampleConfig: ProgramConfig = {
        clientId: clientId || 'sample-client',
        clientName: clientName,
        experienceLevel: "intermediate",
        goal: "strength",
        raceType: "Marathon",
        raceDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
        daysPerWeek: 4,
        programLength: 12,
        startDate: new Date().toISOString(),
        workoutDays: ["monday", "tuesday", "thursday", "friday"]
      };

      console.log('Generating program with config:', sampleConfig);
      const program = await generateProgram(sampleConfig);
      console.log('Generated program:', program);

      if (!program || !program.workouts || program.workouts.length === 0) {
        throw new Error('Failed to generate program with workouts');
      }

      // Save the program
      localStorage.setItem('currentProgram', JSON.stringify(program));
      
      // Update state
      setSelectedProgram(program);
      
      console.log('Saved program to localStorage:', program);
    } catch (error) {
      console.error('Error generating program:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate program');
    } finally {
      setLoading(false);
    }
  }, [clientId, clientName]);

  const loadProgram = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isOpen) return;

      // If no clientId, this is a sample client
      if (!clientId) {
        console.log('No clientId provided, using sample client');
        setClientName('Sample Client');
        
        // Try to load existing program for sample client
        const storedProgram = localStorage.getItem('currentProgram');
        console.log('Stored program for sample client:', storedProgram);
        if (storedProgram) {
          const program = JSON.parse(storedProgram);
          if (program && program.workouts && program.workouts.length > 0) {
            console.log('Found stored program:', program);
            setSelectedProgram(program);
            return;
          }
        }
        
        // No program found, generate a new one
        console.log('No program found for sample client, generating new one...');
        await handleGenerateProgram();
        return;
      }

      // Load client data
      const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
      console.log('All saved clients:', savedClients);
      console.log('Looking for client with ID:', clientId);
      
      const client = savedClients.find((c: any) => {
        console.log('Comparing client ID:', c.id, 'with:', clientId);
        return c.id === clientId;
      });
      
      if (!client) {
        console.error('Client not found in localStorage. All clients:', savedClients);
        setError('Client not found');
        return;
      }

      setClientName(client.name);
      console.log('Set client name:', client.name);

      // Load client's active program
      if (client.activeProgram) {
        const savedPrograms = JSON.parse(localStorage.getItem('programs') || '[]');
        console.log('All saved programs:', savedPrograms);
        const program = savedPrograms.find((p: Program) => p.id === client.activeProgram);
        console.log('Found program:', program);
        
        if (program) {
          console.log('Setting active program:', program);
          setSelectedProgram(program);
          localStorage.setItem('currentProgram', JSON.stringify(program));
          return;
        }
      }

      // If no program found, generate a new one
      console.log('No program found for client, generating new one...');
      await handleGenerateProgram();
    } catch (error) {
      console.error('Error loading program:', error);
      setError(error instanceof Error ? error.message : 'Failed to load program');
    } finally {
      setLoading(false);
    }
  }, [clientId, handleGenerateProgram, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    console.log('WeightRoomView opened with clientId:', clientId);
    loadProgram();
  }, [isOpen, clientId, loadProgram]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      motionPreset="slideInBottom"
    >
      <ModalOverlay />
      <ModalContent bg={useColorModeValue('gray.50', 'gray.900')}>
        <ModalCloseButton />
        {!clientId ? (
          <Box minH="100vh" py={8}>
            <VStack spacing={8} mb={16} textAlign="center">
              <Image
                src="/logo.png"
                alt="Strength Platform Logo"
                maxW="400px"
                w="100%"
                mb={4}
              />
            </VStack>
            <ClientSelector onClientSelect={handleClientSelect} />
          </Box>
        ) : (
          <>
            <ModalHeader>
              <HStack>
                <Logo />
                <Text>Weight Room - {clientName}</Text>
              </HStack>
            </ModalHeader>
            <ModalBody>
              {error && (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              {loading ? (
                <Center p={8}>
                  <Spinner size="xl" />
                </Center>
              ) : selectedProgram ? (
                <WeightRoom
                  clientName={clientName}
                  onBack={onClose}
                  program={selectedProgram}
                />
              ) : (
                <Center p={8}>
                  <VStack spacing={4}>
                    <Text>No active program found.</Text>
                    <Button
                      colorScheme="blue"
                      onClick={handleGenerateProgram}
                      isLoading={loading}
                    >
                      Generate Program
                    </Button>
                  </VStack>
                </Center>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
