import { mapAllowedProperties } from './property-mapper';

const exampleBadObject = {
    version: 7,
};

const exampleMappableObject = {
    id: '123456',
    orderState: 'Open',
};

describe('mapAllowedProperties', () => {
    it('should return the original object if no properties are defined for the type', () => {
        const mappedProperties = mapAllowedProperties('customer', exampleBadObject);
        expect(mappedProperties).toEqual(exampleBadObject);
    });

    it('should return an empty object if no mappable properties are found', () => {
        const mappedProperties = mapAllowedProperties('order', exampleBadObject);
        expect(mappedProperties).toEqual({});
    });

    it('should return an object with the allowed properties, remapped depending on definition', () => {
        const mappedProperties = mapAllowedProperties('order', exampleMappableObject);
        expect(mappedProperties).toEqual({
            orderId: '123456',
            orderState: 'Open',
        });
    });
});
