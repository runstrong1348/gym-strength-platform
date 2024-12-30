import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  Tag,
  VStack,
  HStack,
  Wrap,
  WrapItem,
  UnorderedList,
  ListItem,
  Center,
  Spinner,
  AspectRatio,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

interface Exercise {
  name: string;
  type: string;
  equipment: string;
  difficulty: string;
  muscle_groups: string[];
  video_path?: string;
  instructions: string[];
  tips: string[];
}

interface ExerciseDatabase {
  exercises: Record<string, Exercise>;
}

export const ExerciseDemo: React.FC<{ exerciseName: string }> = ({ exerciseName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  const handleDemoClick = async () => {
    console.log('Demo button clicked');
    setIsOpen(true);
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching exercise data...');
      const dbResponse = await fetch('/exercise_database.json');
      const data: ExerciseDatabase = await dbResponse.json();
      console.log('Exercise database:', data);

      // Normalize the exercise name for lookup
      const normalizedInput = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '');
      console.log('Normalized input:', normalizedInput);

      // Find the exercise by normalized name
      const exerciseKey = Object.keys(data.exercises).find(key => {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        console.log('Comparing:', { normalizedKey, normalizedInput });
        return normalizedKey === normalizedInput;
      });

      console.log('Found exercise key:', exerciseKey);
      
      if (!exerciseKey) {
        throw new Error(`Exercise "${exerciseName}" not found`);
      }

      const exercise = data.exercises[exerciseKey];
      console.log('Found exercise:', exercise);
      setExercise(exercise);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        leftIcon={<InfoIcon />}
        colorScheme="brand"
        variant="solid"
        onClick={handleDemoClick}
        size="sm"
        ml={2}
      >
        View Demo
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        size="xl"
        onCloseComplete={() => {
          setError(null);
          setExercise(null);
        }}
      >
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">{exerciseName}</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <Box 
              borderRadius="md" 
              bg="gray.800"
              minHeight="300px"
              border="1px solid"
              borderColor="gray.700"
              overflow="hidden"
            >
              {loading ? (
                <Center height="300px">
                  <Spinner size="xl" color="blue.400" />
                </Center>
              ) : error ? (
                <Center height="300px">
                  <Text color="red.400">{error}</Text>
                </Center>
              ) : exercise ? (
                <VStack spacing={4} p={4}>
                  {/* Video Container */}
                  <AspectRatio width="100%" ratio={16 / 9}>
                    <Box
                      as="video"
                      borderRadius="md"
                      controls
                      autoPlay
                      loop
                      muted
                      src={exercise.video_path}
                      objectFit="cover"
                      sx={{
                        '&::-webkit-media-controls-panel': {
                          bg: 'gray.700',
                        },
                      }}
                    />
                  </AspectRatio>

                  {/* Exercise Details */}
                  <Box width="100%">
                    <HStack spacing={2} mb={2}>
                      <Tag colorScheme="brand">{exercise.type}</Tag>
                      <Tag colorScheme="brand" variant="outline">{exercise.difficulty}</Tag>
                      <Tag colorScheme="brand" variant="subtle">{exercise.equipment}</Tag>
                    </HStack>
                    <Wrap spacing={2}>
                      {exercise.muscle_groups.map((muscle, index) => (
                        <WrapItem key={index}>
                          <Tag size="sm" colorScheme="brand">{muscle}</Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>

                  {/* Instructions */}
                  <Box width="100%">
                    <Text fontWeight="bold" mb={2} color="white">Instructions:</Text>
                    <UnorderedList spacing={1} color="white">
                      {exercise.instructions.map((instruction, index) => (
                        <ListItem key={index}>{instruction}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>

                  {/* Tips */}
                  <Box width="100%">
                    <Text fontWeight="bold" mb={2} color="white">Tips:</Text>
                    <UnorderedList spacing={1} color="white">
                      {exercise.tips.map((tip, index) => (
                        <ListItem key={index}>{tip}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                </VStack>
              ) : (
                <Center height="300px">
                  <Text color="gray.500">No exercise data available</Text>
                </Center>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
