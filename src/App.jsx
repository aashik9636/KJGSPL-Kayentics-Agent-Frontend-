import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRouter from './routes';

import { useThemeStore } from './store/themeStore';

function App() {
  useThemeStore.getState().initTheme();

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </>
  );
}

export default App;

