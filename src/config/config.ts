const config = {
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
