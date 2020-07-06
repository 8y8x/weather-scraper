// Note: some properties may be an empty string ("") if they aren't specified.
// For example, wind_kmh will not be available in the US.

/**
 * An interface for the data received from the weather network.
 */
interface WeatherData {
    id: string,
    X: string,
    Y: string,
    name_en: string,
    name_fr: string,
    name_de: string,
    country_en: string,
    country_fr: string,
    temp_c: number,
    temp_f: number,
    feelslike_c: number,
    feelslike_f: number,
    humidex: number | '',
    humidity: number | '',
    timestamp: number,
    wind_kmh: number | '',
    wind_mh: number | '',
    wind_direction: number | '',
    icon: string,
    desc_en: string,
    desc_fr: string,
    name: string,
    country: string,
    desc: string,
    temp: number,
    unit: string,
    feelslike: number,
    wind: number | '',
    feelslike_set: boolean
}

export default WeatherData;