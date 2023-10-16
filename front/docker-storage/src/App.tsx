import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './App.css';
import MainPage from './pages/MainPage.tsx';
import {Center, createTheme, MantineProvider, Paper} from '@mantine/core';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import NotFound from './pages/NotFound.tsx';
import Join from './pages/Join.tsx';
import SnowBackground from "./Components/SnowBackground.tsx";

const theme = createTheme({
  primaryColor: 'red'
});

export default function App() {
  return (
      <MantineProvider theme={theme}>
        <SnowBackground>
          <Center miw={'100vw'} mih={'100vh'} m={0} p={0} pos={'absolute'} top={0}>
            <Paper bg={'white'} p={'xl'} radius={'md'} shadow={'xl'} withBorder>
              <BrowserRouter>
                <Routes>
                  <Route path={'/'} element={<MainPage/>}/>
                  <Route path={'/join'} element={<Join/>}/>
                  <Route path={'*'} element={<NotFound/>}/>
                </Routes>
              </BrowserRouter>
            </Paper>
          </Center>
        </SnowBackground>
      </MantineProvider>
  );
}
