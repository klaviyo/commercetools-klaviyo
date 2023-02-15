import config from 'config';

export const mapAllowedProperties = (objectType: string, object: any) => {
    if (!config.has(`${objectType}.properties.include`)) {
        return object;
    }
    const allowedProperties: string[] = config.get(`${objectType}.properties.include`) || [];
    if (Object.keys(allowedProperties).length === 0) {
        return object;
    }
    const mappableProperties: any = config.get(`${objectType}.properties.map`) || {};
    return Object.fromEntries(
        allowedProperties
            .filter((value) => !!object[value])
            .map((value: string) => [mappableProperties[value] || value, object[value]]),
    );
};
