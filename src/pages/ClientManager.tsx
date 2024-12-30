import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  SimpleGrid,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import type { ClientData, MovementMax } from '../types/client';
import type { Program } from '../types/program';

const ClientManager = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [newClient, setNewClient] = useState<Partial<ClientData>>({
    name: '',
    goals: [],
    injuries: [],
    movementMaxes: {},
    notes: '',
    programs: [],
    activeProgram: null,
  });

  useEffect(() => {
    // Load clients from localStorage
    const savedClients = localStorage.getItem('clients');
    console.log('Loading clients from localStorage:', savedClients);
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
  }, []);

  const handleCreateClient = () => {
    if (!newClient.name) {
      toast({
        title: 'Error',
        description: 'Please enter a client name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Generate a proper UUID for the client
    const clientId = crypto.randomUUID();
    console.log('Generated client ID:', clientId);

    const client: ClientData = {
      id: clientId,
      name: newClient.name,
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      goals: newClient.goals || [],
      injuries: newClient.injuries || [],
      movementMaxes: newClient.movementMaxes || {},
      notes: newClient.notes || '',
      programs: [],
      activeProgram: null,
    };

    console.log('Creating new client:', client);

    // Get existing clients
    const existingClients = JSON.parse(localStorage.getItem('clients') || '[]');
    console.log('Existing clients:', existingClients);

    const updatedClients = [...existingClients, client];
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    console.log('Updated clients in localStorage:', updatedClients);

    setNewClient({
      name: '',
      goals: [],
      injuries: [],
      movementMaxes: {},
      notes: '',
      programs: [],
      activeProgram: null,
    });

    onClose();
    navigate(`/client/${clientId}`);
  };

  const handleUpdateClientProgram = (clientId: string, program: Program) => {
    setClients(prevClients => {
      const updatedClients = prevClients.map(client => {
        if (client.id === clientId) {
          return {
            ...client,
            programs: [...client.programs, program.id],
            activeProgram: program.id,
            lastUpdated: new Date().toISOString(),
          };
        }
        return client;
      });

      localStorage.setItem('clients', JSON.stringify(updatedClients));
      return updatedClients;
    });
  };

  return (
    <Box maxW="1200px" mx="auto" py={8} px={4}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Clients</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Add Client
          </Button>
        </HStack>

        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {clients.map(client => (
            <Box
              key={client.id}
              p={6}
              borderRadius="lg"
              bg="gray.800"
              border="1px"
              borderColor="gray.700"
              cursor="pointer"
              onClick={() => navigate(`/client/${client.id}`)}
              _hover={{ borderColor: 'blue.500' }}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">{client.name}</Heading>
                <HStack>
                  <Badge colorScheme={client.activeProgram ? 'green' : 'gray'}>
                    {client.activeProgram ? 'Active Program' : 'No Active Program'}
                  </Badge>
                  <Badge colorScheme="purple">
                    {client.programs.length} Program{client.programs.length !== 1 ? 's' : ''}
                  </Badge>
                </HStack>
                {client.goals.length > 0 && (
                  <Text fontSize="sm" color="gray.400">
                    Goals: {client.goals.join(', ')}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500">
                  Last Updated: {new Date(client.lastUpdated).toLocaleDateString()}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg="gray.800">
            <ModalHeader>Add New Client</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Goals</FormLabel>
                  <Textarea
                    value={newClient.goals?.join('\n')}
                    onChange={(e) => setNewClient(prev => ({
                      ...prev,
                      goals: e.target.value.split('\n').filter(Boolean)
                    }))}
                    placeholder="Enter goals (one per line)"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter any additional notes"
                  />
                </FormControl>

                <HStack spacing={4} width="100%">
                  <Button colorScheme="blue" onClick={handleCreateClient}>
                    Create Client
                  </Button>
                  <Button onClick={onClose}>Cancel</Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default ClientManager;
