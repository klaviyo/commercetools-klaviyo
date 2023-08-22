import config from 'config';

export const mapAllowedProperties = (objectType: string, object: any) => {
    const includeSetting = `${objectType}.properties.include`;
    const excludeSetting = `${objectType}.properties.exclude`;
    const mapSetting = `${objectType}.properties.map`;

    const includeProperties: string[] =
        config.has(includeSetting) && (config.get(includeSetting) as []).length > 0
            ? config.get(includeSetting)
            : Object.keys(object);

    const excludeProperties: string[] = config.has(excludeSetting) ? config.get(excludeSetting) : [];

    const mapProperties: Record<string, string> = config.has(mapSetting) ? config.get(mapSetting) : {};

    return Object.fromEntries(
        includeProperties
            .filter((value) => !excludeProperties.includes(value))
            .filter((value) => !!object[value])
            .map((value: string) => [mapProperties[value] || value, object[value]]),
    );
};
