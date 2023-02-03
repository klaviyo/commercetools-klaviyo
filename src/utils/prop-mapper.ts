import config from '../config/config';

export const getConfigProperty = (propertyPath: string, prop: unknown) => {
    return resolve(propertyPath, config)?.find((x: any) => x.sources?.includes(prop))?.value;
};

function resolve(path: string, obj: any, separator = '.') {
    const properties = path.split(separator);
    return properties.reduce((prev, curr) => prev?.[curr], obj);
}
