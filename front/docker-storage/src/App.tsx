import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './App.css';
import MainPage from './pages/MainPage.tsx';
import {Center, createTheme, MantineProvider} from '@mantine/core';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import NotFound from './pages/NotFound.tsx';

const theme = createTheme({
  primaryColor: 'red'
});

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Center miw={'100vw'} mih={'100vh'} m={0} p={0} pos={'absolute'} top={0}>
        <BrowserRouter>
          <Routes>
            <Route path={'/'} element={<MainPage/>}/>
            <Route path={'*'} element={<NotFound/>}/>
          </Routes>
        </BrowserRouter>
      </Center>
    </MantineProvider>
  );
}
