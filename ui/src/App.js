import './App.css';
import Filters from './components/filters/Filters';
import DataTable from './components/table/Table';
import { Container, Stack } from '@mui/material';
import { useState } from 'react';

function App() {
  const [data, setData] = useState([]);

  const onDataChange = (data) => {
    setData(data);
  }

  return (
      <Container maxWidth={false}>
        <Stack direction={'column'} spacing={4} alignItems={'stretch'}>
        <Filters setData={onDataChange}/>
        <DataTable data={data}/>
      </Stack>  
      </Container>
  );
}

export default App;
