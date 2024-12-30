import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#000000',
        color: 'white',
      },
    },
  },
  colors: {
    brand: {
      50: '#fff3e6',
      100: '#ffe0bf',
      200: '#ffcd99',
      300: '#ffb973',
      400: '#ffa64d',
      500: '#ff9326', // Main brand color - vibrant orange
      600: '#e67d00',
      700: '#cc6f00',
      800: '#b36200',
      900: '#995400',
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      baseStyle: {
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.500',
            opacity: 0.8,
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'gray.800',
        }
      }
    }
  },
});

export default theme;
