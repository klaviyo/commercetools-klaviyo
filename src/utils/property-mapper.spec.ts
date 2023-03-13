import { mapAllowedProperties } from './property-mapper';
import config from 'config';

function configureMocks({ has, get = {} }: { has: Record<string, boolean>; get?: Record<string, any> }) {
    jest.spyOn(config, 'has').mockImplementation((setting) => {
        if (Object.prototype.hasOwnProperty.call(has, setting)) {
            return has[setting];
        }
        return false;
    });

    jest.spyOn(config, 'get').mockImplementation((setting) => {
        if (Object.prototype.hasOwnProperty.call(get, setting)) {
            return get[setting];
        } else {
            throw new Error(`Unknown setting: ${setting}`);
        }
    });
}

describe('mapAllowedProperties', () => {
    beforeEach(jest.restoreAllMocks);

    it('returns an object equal to the input object if the config does not have include or exclude properties', () => {
        configureMocks({
            has: {
                'some-value.properties.include': false,
                'some-value.properties.exclude': false,
                'some-value.properties.map': false,
            },
        });

        const mappedProperties = mapAllowedProperties('some-value', { a: '1', b: '2', c: '3' });
        expect(mappedProperties).toEqual({ a: '1', b: '2', c: '3' });
    });

    it('returns an object that includes only properties listed in the config include properties array', () => {
        configureMocks({
            has: {
                'some-value.properties.include': true,
                'some-value.properties.exclude': false,
                'some-value.properties.map': false,
            },
            get: {
                'some-value.properties.include': ['b', 'c'],
            },
        });

        const mappedProperties = mapAllowedProperties('some-value', { a: '1', b: '2', c: '3' });
        expect(mappedProperties).toEqual({ b: '2', c: '3' });
    });

    it('returns an empty object if no input object properties are listed in the config include properties array', () => {
        configureMocks({
            has: {
                'some-value.properties.include': true,
                'some-value.properties.exclude': false,
                'some-value.properties.map': false,
            },
            get: {
                'some-value.properties.include': ['d'],
            },
        });

        const mappedProperties = mapAllowedProperties('some-value', { a: '1', b: '2', c: '3' });
        expect(mappedProperties).toEqual({});
    });

    it('excludes no properties if the config exclude properties value is an empty array', () => {
        configureMocks({
            has: {
                'some-value.properties.include': true,
                'some-value.properties.exclude': true,
                'some-value.properties.map': false,
            },
            get: {
                'some-value.properties.include': [],
                'some-value.properties.exclude': [],
            },
        });

        const mappedProperties = mapAllowedProperties('some-value', { a: '1', b: '2', c: '3' });
        expect(mappedProperties).toEqual({ a: '1', b: '2', c: '3' });
    });

    it('excludes all properties listed in the config exclude properties array (include = [])', () => {
        configureMocks({
            has: {
                'some-value.properties.include': true,
                'some-value.properties.exclude': true,
                'some-value.properties.map': false,
            },
            get: {
                'some-value.properties.include': [],
                'some-value.properties.exclude': ['a', 'c', 'd'],
            },
        });

        const mappedProperties = mapAllowedProperties('some-value', { a: '1', b: '2', c: '3' });
        expect(mappedProperties).toEqual({ b: '2' });
    });

    it('excludes all properties listed in the config exclude properties array (include = not present)', () => {
        configureMocks({
            has: {
                'some-value.properties.include': false,
                'some-value.properties.exclude': true,
                'some-value.properties.map': false,
            },
            get: {
                'some-value.properties.exclude': ['a', 'c', 'd'],
            },
        });

        const mappedProperties = mapAllowedProperties('some-value', { a: '1', b: '2', c: '3' });
        expect(mappedProperties).toEqual({ b: '2' });
    });

    it('overrides an explicit include with an explicit exclude', () => {
        configureMocks({
            has: {
                'some-value.properties.include': true,
                'some-value.properties.exclude': true,
                'some-value.properties.map': false,
            },
            get: {
                'some-value.properties.include': ['a', 'c'],
                'some-value.properties.exclude': ['a'],
            },
        });

        const mappedProperties = mapAllowedProperties('some-value', { a: '1', b: '2', c: '3' });
        expect(mappedProperties).toEqual({ c: '3' });
    });

    it('maps properties according to the config', () => {
        configureMocks({
            has: {
                'some-value.properties.include': true,
                'some-value.properties.exclude': false,
                'some-value.properties.map': true,
            },
            get: {
                'some-value.properties.include': [],
                'some-value.properties.map': {
                    a: 'aa',
                    c: 'cc',
                }
            },
        });

        const mappedProperties = mapAllowedProperties('some-value', { a: '1', b: '2', c: '3' });
        expect(mappedProperties).toEqual({ aa: '1', b: '2', cc: '3' });
    })
});
