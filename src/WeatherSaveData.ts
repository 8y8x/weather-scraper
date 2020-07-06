
/**
 * Represents how the daily peak temperature is saved in ./storage/temperatures.json
 */
interface WeatherSaveData {
    /** The amount of days since 1/1/1970 */
    day: number,

    /** Counts how many times this entry was updated (determines accuracy) */
    records: number,

    /** The temperature in celsius */
    temperature: number
}

export default WeatherSaveData;