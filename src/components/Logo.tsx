import { Image, ImageProps } from '@chakra-ui/react';

interface LogoProps extends Omit<ImageProps, 'src' | 'alt'> {
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ variant = 'light', ...props }) => {
  // Since the logo is orange, we can use the same version for both light and dark modes
  const logoUrl = '/logo.png';  // Single logo file

  return (
    <Image
      src={logoUrl}
      alt="Driven Training Systems"
      height="40px"
      objectFit="contain"
      {...props}
    />
  );
};
