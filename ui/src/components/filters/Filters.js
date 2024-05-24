import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Stack } from '@mui/material';
import { useState } from 'react';

function Filters({setData}) {
    const [searching, setSearching] = useState(false);

    const getButton = (searching) => {
        if (!searching) {
            return <Button variant="contained" onClick={handleSearch}>Search</Button>
        } else {
            return <Button variant="outlined" disabled><CircularProgress size="1rem" /></Button>
        }
    };

    const handleSearch = () => {
        setSearching(true);
        // Make api call and set searching to false
        setTimeout(() => {
            setSearching(false);
            setData([{
                "region": "region",
                "province": "province",
                "city": "city"
            }]);
        }, 500);
    }
    return (
    <Stack direction="row" spacing={1} alignItems={'stretch'} justifyContent={'space-between'}>
        <TextField label="Region" variant="outlined" disabled={searching}/>
        <TextField label="Province" variant="outlined" disabled={searching}/>
        <TextField label="City" variant="outlined" disabled={searching}/>
        {getButton(searching)}
    </Stack>
    );
}

export default Filters