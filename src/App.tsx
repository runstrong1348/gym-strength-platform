import { useState } from 'react';
import { ChakraProvider, Container } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';

import { Home } from './pages/Home';
import { Staff } from './pages/Staff';
import ClientProfile from './pages/ClientProfile';
import ProgramBuilder from './pages/ProgramBuilder';
import { WeightRoomView } from './components/WeightRoomView';
import { AddClient } from './pages/AddClient';

function App() {
  const [isWeightRoomOpen, setIsWeightRoomOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const handleWeightRoomOpen = (clientId: string) => {
    console.log('Opening weight room for client:', clientId);
    setSelectedClient(clientId);
    setIsWeightRoomOpen(true);
  };

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Container maxW="container.xl" p={4}>
          <Routes>
            <Route path="/" element={<Home onWeightRoomOpen={() => {
              console.log('Opening sample weight room');
              setSelectedClient(null);
              setIsWeightRoomOpen(true);
            }} />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/client/:clientId" element={<ClientProfile onWeightRoomOpen={handleWeightRoomOpen} />} />
            <Route path="/program-builder" element={<ProgramBuilder />} />
            <Route path="/add-client" element={<AddClient />} />
            {/* Redirect old weight-room routes to home */}
            <Route path="/weight-room/*" element={<Navigate to="/" replace />} />
            {/* Catch all other routes and redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
        {/* Weight Room Modal */}
        <WeightRoomView
          isOpen={isWeightRoomOpen}
          onClose={() => setIsWeightRoomOpen(false)}
        />
      </Router>
    </ChakraProvider>
  );
}

export default App;
