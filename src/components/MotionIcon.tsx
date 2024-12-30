import React from 'react';
import { Box, keyframes } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface MotionIconProps {
  isCompleted: boolean;
  onClick: () => void;
}

const MotionBox = motion(Box);

export const MotionIcon: React.FC<MotionIconProps> = ({ isCompleted, onClick }) => {
  const pulseKeyframes = keyframes`
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  `;

  const pulseAnimation = `${pulseKeyframes} 2s ease-in-out infinite`;

  return (
    <MotionBox
      as="button"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="50px"
      height="50px"
      borderRadius="full"
      bg={isCompleted ? "green.500" : "gray.600"}
      cursor="pointer"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animation={!isCompleted ? pulseAnimation : undefined}
      transition={{ duration: 0.2 }}
    >
      <Box
        as="svg"
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isCompleted ? "white" : "gray.300"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isCompleted ? (
          // Checkmark icon
          <path d="M20 6L9 17L4 12" />
        ) : (
          // Motion icon (dumbbell)
          <>
            <path d="M6 4v16M18 4v16M8 4h8M8 20h8M4 8h4M16 8h4M4 16h4M16 16h4" />
          </>
        )}
      </Box>
    </MotionBox>
  );
};
