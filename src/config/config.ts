const config: any = {
    order: {
        changedStates: [
            {
                sources: ['Cancelled'],
                value: 'Cancelled Order',
            },
            {
                sources: ['Confirmed', 'Complete'],
                value: 'Fulfilled Order',
            },
        ],
        createdStates: [
            {
                sources: ['OrderCreated', 'Open'],
                value: 'Order created',
            },
            {
                sources: ['OrderedProduct'],
                value: 'Ordered Product',
            },
        ],
        refundedStates: [
            {
                sources: ['OrderRefunded'],
                value: 'Refunded Order',
            },
        ],
        messageTypes: [
            {
                sources: ['OrderCreated', 'OrderImported', 'OrderCustomerSet'],
                value: true,
            },
        ],
        allowedProperties: {
            customerId: null,
            customerEmail: null,
            id: 'orderId',
            createdAt: null,
            lastModifiedAt: null,
            lineItems: 'items',
            customLineItems: 'customItems',
            totalPrice: null,
            orderState: null,
        },
    },
    customer: {
        addressChangeMessages: [
            {
                sources: ['CustomerAddressAdded', 'CustomerAddressRemoved', 'CustomerAddressChanged'],
                value: true,
            },
        ],
    },
};

export default config;
