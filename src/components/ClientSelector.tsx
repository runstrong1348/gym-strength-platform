import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
  useColorModeValue,
  Badge,
  HStack,
  Spacer,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { Client } from '../types/client';

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ onClientSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const searchBg = useColorModeValue('white', 'gray.800');
  const resultsBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const loadClients = () => {
      const savedClients = localStorage.getItem('clients');
      if (savedClients) {
        const parsedClients = JSON.parse(savedClients);
        console.log('Loaded clients:', parsedClients);
        setClients(parsedClients);
      }
    };

    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxW="container.md">
      <VStack spacing={8}>
        <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('gray.700', 'white')}>
          Select a Client
        </Text>
        
        <Box position="relative" w="100%">
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              bg={searchBg}
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="full"
              boxShadow="lg"
              _focus={{
                boxShadow: 'xl',
                borderColor: 'brand.500',
              }}
              size="lg"
              fontSize="xl"
            />
          </InputGroup>

          {searchQuery && (
            <Box
              mt={4}
              bg={resultsBg}
              borderRadius="xl"
              boxShadow="xl"
              maxH="400px"
              overflowY="auto"
              w="100%"
            >
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <Box
                    key={client.id}
                    p={6}
                    _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                    cursor="pointer"
                    onClick={() => onClientSelect(client)}
                    borderBottomWidth={1}
                    borderColor={useColorModeValue('gray.100', 'gray.700')}
                    _last={{ borderBottomWidth: 0 }}
                  >
                    <HStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold">{client.name}</Text>
                        {client.goals.length > 0 && (
                          <Text fontSize="md" color="gray.500">
                            {client.goals[0]}
                          </Text>
                        )}
                      </VStack>
                      <Spacer />
                      <Badge 
                        colorScheme={client.activeProgram ? 'green' : 'gray'}
                        fontSize="md"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {client.activeProgram ? 'Active Program' : 'No Program'}
                      </Badge>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Box p={6} textAlign="center">
                  <Text color="gray.500" fontSize="lg">No clients found</Text>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
};
