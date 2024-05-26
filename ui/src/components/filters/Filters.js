import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ButtonGroup, Stack } from '@mui/material';
import { useState } from 'react';
import CityService from '../../services/CityService';

function Filters({setData}) {
    const [searching, setSearching] = useState(false);
    const [scraping, setScraping] = useState(false);
    const service = new CityService();

    const [region, setRegion] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');

    const handleChanges = (event) => {
        console.log(event.target.id);
        if (event.target.id === 'region') {
            setRegion(event.target.value);
        } else if (event.target.id === 'province') {
            setProvince(event.target.value);
        } else if (event.target.id === 'city') {
            setCity(event.target.value);
        }
    };

    const getSearchBtn = (searching) => {
        if (!searching) {
            return <Button variant="contained" onClick={handleSearch}>Search</Button>
        } else {
            return <Button variant="outlined" disabled>Searching <CircularProgress size="1rem" /></Button>
        }
    }

    const getScrapeBtn = (scraping) => {
        if (!scraping) {
            return <Button variant="outlined" onClick={handleScrape}>Scrape</Button>
        } else {
            return <Button variant="outlined" disabled>Scraping <CircularProgress size="1rem" /></Button>
        }
    }

    const getButtons = () => {
        return (
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                {getSearchBtn(searching)}
                {getScrapeBtn(scraping)}
            </ButtonGroup>
        )
    };

    const handleScrape = () => {
        setScraping(true);
        service.scrape().then(() => {
            setScraping(false);
        }).catch((err) => {
            setScraping(false);
            console.error(err);
            alert(err);
        });
    }

    const handleSearch = () => {
        setSearching(true);
        // Get data from text fields
        const query = {
            region: region,
            province: province,
            name: city
        }
        // Make api call and set searching to false
        service.find(query).then((data) => {
            setSearching(false);
            setData(data);
        }).catch((err) => {
            setSearching(false);
            alert(err);
        });
    }
    return (
    <Stack direction="row" spacing={1} alignItems={'stretch'} justifyContent={'space-between'}>
        <TextField id='region' value={region} label="Region" variant="outlined" disabled={searching} onChange={handleChanges}/>
        <TextField id='province' value={province} label="Province" variant="outlined" disabled={searching} onChange={handleChanges}/>
        <TextField id='city' value={city} label="City" variant="outlined" disabled={searching} onChange={handleChanges}/>
        {getButtons()}
    </Stack>
    );
}

export default Filters