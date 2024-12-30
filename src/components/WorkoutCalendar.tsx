import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Box, Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Text, HStack } from '@chakra-ui/react';
import { ChevronDownIcon, CalendarIcon } from '@chakra-ui/icons';
import { Workout } from '../types';
import "react-datepicker/dist/react-datepicker.css";

interface WorkoutCalendarProps {
  workouts: Workout[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  completedWorkouts: string[];
}

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  workouts,
  selectedDate,
  onDateSelect,
  completedWorkouts,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Convert workout dates to Date objects
  const workoutDates = workouts.map(w => new Date(w.date));
  
  // Get the workout for a specific date
  const getWorkoutForDate = (date: Date) => {
    return workouts.find(w => {
      const workoutDate = new Date(w.date);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  // Format the selected date display
  const formatSelectedDate = () => {
    if (!selectedDate) return 'Select a date';
    const date = new Date(selectedDate);
    const workout = getWorkoutForDate(date);
    const isCompleted = workout && completedWorkouts.includes(workout.id);
    return (
      <HStack spacing={2}>
        <Text>
          {date.toLocaleDateString()} - Week {workout?.week}, Day {workout?.day}
        </Text>
        {isCompleted && (
          <Text color="green.500" fontSize="sm">
            (Completed)
          </Text>
        )}
      </HStack>
    );
  };

  // Custom day rendering
  const renderDayContents = (day: number, date: Date) => {
    const workout = getWorkoutForDate(date);
    if (!workout) return day;

    const isCompleted = completedWorkouts.includes(workout.id);
    const isSelected = selectedDate && new Date(selectedDate).toDateString() === date.toDateString();

    return (
      <Box
        bg={isCompleted ? 'green.500' : isSelected ? 'blue.500' : 'transparent'}
        color={isCompleted || isSelected ? 'white' : undefined}
        borderRadius="md"
        px={2}
        py={1}
      >
        {day}
      </Box>
    );
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-start"
      autoFocus={false}
    >
      <PopoverTrigger>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          rightIcon={<ChevronDownIcon />}
          leftIcon={<CalendarIcon />}
          bg="gray.700"
          _hover={{ bg: 'gray.600' }}
          size="sm"
          minW="250px"
          justifyContent="space-between"
        >
          {formatSelectedDate()}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        bg="gray.800"
        borderColor="gray.700"
        w="auto"
        p={0}
      >
        <PopoverBody p={0}>
          <Box
            className="custom-datepicker-wrapper"
            sx={{
              '.react-datepicker': {
                bg: 'gray.800',
                border: 'none',
                borderRadius: 'lg',
                fontFamily: 'inherit',
              },
              '.react-datepicker__header': {
                bg: 'gray.700',
                borderBottom: 'none',
              },
              '.react-datepicker__current-month': {
                color: 'white',
              },
              '.react-datepicker__day-name': {
                color: 'gray.400',
              },
              '.react-datepicker__day': {
                color: 'white',
                '&:hover': {
                  bg: 'blue.500',
                },
              },
              '.react-datepicker__day--selected': {
                bg: 'blue.500',
                color: 'white',
              },
              '.react-datepicker__day--disabled': {
                color: 'gray.600',
                '&:hover': {
                  bg: 'transparent',
                },
              },
            }}
          >
            <DatePicker
              selected={selectedDate ? new Date(selectedDate) : null}
              onChange={(date: Date) => {
                const workout = getWorkoutForDate(date);
                if (workout) {
                  onDateSelect(workout.date);
                  setIsOpen(false);
                }
              }}
              inline
              highlightDates={workoutDates}
              renderDayContents={renderDayContents}
              calendarStartDay={1}
              minDate={workoutDates[0]}
              maxDate={workoutDates[workoutDates.length - 1]}
            />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
