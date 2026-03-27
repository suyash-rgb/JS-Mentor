import './App.css';
import AppRouter from './Router/AppRouter';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressProvider } from './context/ProgressContext';

function App() {
  return (
    <ProgressProvider>
      <AppRouter/> 
    </ProgressProvider>
  );
}

export default App;
