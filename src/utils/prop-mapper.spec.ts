import { getConfigProperty } from './prop-mapper';

jest.mock('../config/config', () => {
    return {
        dummyOuterObject: {
            dummyInnerObject: [
                {
                    sources: ['ExampleSource1', 'ExampleSource2'],
                    value: 'ExampleValue',
                },
            ],
        },
    };
});

describe('getConfigProperty', () => {
    it('should return a value from config by a defined source', () => {
        const configProperty = getConfigProperty('dummyOuterObject.dummyInnerObject', 'ExampleSource1');
        expect(configProperty).toEqual('ExampleValue');
    });

    it('should return undefined when a property is not defined', () => {
        const configProperty = getConfigProperty('dummyOuterObject.dummyMissingInnerObject', 'ExampleSource1');
        expect(configProperty).toEqual(undefined);
    });

    it("should return undefined when values for a source can't be found", () => {
        const configProperty = getConfigProperty('dummyOuterObject.dummyInnerObject', 'ExampleSource3');
        expect(configProperty).toEqual(undefined);
    });
});
