import axios from 'axios'

class CityService {

    constructor() {
        this.host = process.env.CYTY_HOST ?? "localhost"
        this.port = process.env.CITY_PORT ?? 5000
        this.protocol = process.env.CITY_PROTOCOL ?? "http"

        this.baseUrl = `${this.protocol}://${this.host}:${this.port}`
    }

    async scrape() {
        const url = `${this.baseUrl}/cities/scrape`
        return axios.get(url)
    }

    async list() {
        const url = `${this.baseUrl}/cities`
        return axios.get(url).then(res => res.data);
    }

    async find(query) {
        const url = `${this.baseUrl}/cities/find`
        return axios.get(url, {
            params: query
        }).then(res => res.data);
    }
}

export default CityService;