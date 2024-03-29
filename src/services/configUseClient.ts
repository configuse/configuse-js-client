import {Config} from "../index";
import uuid from "uuid";
const fetch = require("node-fetch");

const configUseUrl: string = "https://api.configuse.dev/configurations/v1";

export interface IConfiguration {
    config: Config;
}

export interface IRawConfig {
    key: string;
    value: string;
    protected: boolean;
}

export async function loadFromService(key: string): Promise<any> {
    const url = `${configUseUrl}/${key}`;
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            "x-correlationId": uuid.v4(),
            "x-agent-name": "configuse-js-client"
        }
    };

    let response = await fetch(url, options)
    return  await response.json()
}

