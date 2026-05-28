import './App.css';
import AppRouter from './Router/AppRouter';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressProvider } from './context/ProgressContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ProgressProvider>
      <Toaster position="top-right" />
      <AppRouter/> 
   
    </ProgressProvider>
  );
}

export default App;
