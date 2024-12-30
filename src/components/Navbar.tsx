import { Box, Flex, Button, Input, InputGroup, InputLeftElement, useColorModeValue } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.900', 'gray.900');

  return (
    <Box bg={bgColor} px={4} position="sticky" top={0} zIndex={1}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Box 
          fontSize="xl" 
          fontWeight="bold" 
          color="brand.primary" 
          cursor="pointer"
          onClick={() => navigate('/')}
        >
          GymStrength AI
        </Box>

        <Flex alignItems="center" flex={1} mx={8}>
          <InputGroup maxW="400px" mx="auto">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search clients..."
              bg="gray.800"
              border="none"
              _placeholder={{ color: 'gray.400' }}
              _hover={{ bg: 'gray.700' }}
              _focus={{ bg: 'gray.700', boxShadow: 'none' }}
            />
          </InputGroup>
        </Flex>

        <Flex alignItems="center">
          <Button
            variant="solid"
            colorScheme="blue"
            size="sm"
            mr={4}
            onClick={() => navigate('/program-builder')}
          >
            New Program
          </Button>
          <Button
            variant="outline"
            colorScheme="blue"
            size="sm"
            onClick={() => {
              // Toggle weight room view - we'll implement this later
            }}
          >
            Weight Room View
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
