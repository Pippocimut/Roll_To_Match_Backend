
type ReturnVariables = any;

export function assertEnvVariables(variables: string[]): ReturnVariables {
    const returnVariables: ReturnVariables = {}
    for (const variable of variables) {
        if (!process.env[variable]) {
            throw new Error(`Environment variable ${variable} is not set`);
        }
        returnVariables[variable] = process.env[variable]
    }
    return returnVariables
}
