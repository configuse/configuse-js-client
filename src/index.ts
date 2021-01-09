import {IRawConfig, loadFromService} from './services/configUseClient';

export interface IInitializeParameters {
    RefreshIntervalTimeInMs: number;
    ProjectKey: string;
    FirstTimeLoadRetryCount: number;
}

export class Config {
    string: string;
    number: number;
    boolean: boolean;

    constructor(private value: string) {
        this.string = value.toString();
        this.number = this.parseNumber();
        this.boolean = this.parseBoolean();
    }

    /**
     * Parses value as number
     * @returns {number}
     */
    private parseNumber() {
        return +this.value;
    }

    /**
     * Parses value as boolean
     * @returns {boolean}
     */
    private parseBoolean() {
        const numberFormat = +this.value;

        if (!isNaN(numberFormat)) {
            return Boolean(+this.value);
        }

        return !/^\s*(false|0|off)\s*$/.test(this.value.toLowerCase());
    }
}

export class Configuration {
    public static config: { [key: string]: Config } = {}
    public static options: IInitializeParameters;

    static async startConfigurationApplication(
        options: IInitializeParameters
    ) {
        Configuration.options = options;

        if (Configuration.options.RefreshIntervalTimeInMs < 1000) {
            Configuration.options.RefreshIntervalTimeInMs = 1000;
            console.log("interval time configured as 1000 ms")
            console.log("interval time least 1000ms")
        }

        await Configuration.fill(
            options.ProjectKey,
        );

        Configuration.reloadConfigurations(options);

        return true;
    }

    private static reloadConfigurations(options: IInitializeParameters) {
        Configuration.fetchConfigurations(options);
    }

    static async fill(
        projectKey: string,
    ): Promise<void> {
        let newConfigurations: IRawConfig[] = []
        let preparsedConfigurations: any

        try {
            newConfigurations = await loadFromService(projectKey);
            preparsedConfigurations = Configuration.mapToConfig(newConfigurations);

        } catch (err) {
            console.log("Err: ", err)
        } finally {
            Configuration.config = Object.assign(
                Configuration.config,
                preparsedConfigurations
            );
        }
    }

    /**
     * Returns config instance
     * @param {keyof ConfigSet} key
     * @returns {Config}
     */
    static get(key: string): Config {
        const config = Configuration.config[key]

        if (config) {
            console.log("requested configuration not found! - key:", key)
            return new Config("default")
        }

        return config
    }

    private static fetchConfigurations(options: IInitializeParameters) {
        setInterval(
            () =>
                Configuration.fill(
                    options.ProjectKey
                ),
            options.RefreshIntervalTimeInMs
        );
    }

    /**
     * Maps config keys to Config instances
     */
    private static mapToConfig(rawConfigList: IRawConfig[]) {
        const ConfigList: { [key: string]: Config } = {}

        for (let c in rawConfigList) {
            ConfigList[rawConfigList[c].key] = new Config(rawConfigList[c].value)
        }

        return ConfigList
    }
}
