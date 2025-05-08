import { groupIntoMaxSizeJobs } from './job-grouper';

describe('groupIntoMaxSizeJobs', () => {
    it('should return a single job with 80 items when provided 2 jobs with 50 and 30 items', () => {
        const exampleJobArray: any[] = [
            {
                type: 'itemCreated',
                body: {
                    data: {
                        type: 'catalog-item-bulk-create-job',
                        attributes: {
                            items: {
                                data: Array(50)
                                    .fill('test-id')
                                    .map((y) => ({ type: 'catalog-item', id: y })),
                            },
                        },
                    },
                },
            },
            {
                type: 'itemCreated',
                body: {
                    data: {
                        type: 'catalog-item-bulk-create-job',
                        attributes: {
                            items: {
                                data: Array(30)
                                    .fill('test-id')
                                    .map((y) => ({ type: 'catalog-item', id: y })),
                            },
                        },
                    },
                },
            },
        ];
        const jobs: any = groupIntoMaxSizeJobs(exampleJobArray, ['itemCreated'], 'items');

        expect(jobs.itemCreated).toBeDefined();
        expect(jobs.itemCreated.length).toEqual(1);
        expect(jobs.itemCreated[0].body.data.attributes.items.data.length).toEqual(80);
    });

    it('should return two jobs split 100/30 when provided 2 jobs with 80 and 50 items', () => {
        const exampleJobArray: any[] = [
            {
                type: 'itemCreated',
                body: {
                    data: {
                        type: 'catalog-item-bulk-create-job',
                        attributes: {
                            items: {
                                data: Array(80)
                                    .fill('test-id')
                                    .map((y) => ({ type: 'catalog-item', id: y })),
                            },
                        },
                    },
                },
            },
            {
                type: 'itemCreated',
                body: {
                    data: {
                        type: 'catalog-item-bulk-create-job',
                        attributes: {
                            items: {
                                data: Array(50)
                                    .fill('test-id')
                                    .map((y) => ({ type: 'catalog-item', id: y })),
                            },
                        },
                    },
                },
            },
        ];
        const jobs: any = groupIntoMaxSizeJobs(exampleJobArray, ['itemCreated'], 'items');

        expect(jobs.itemCreated).toBeDefined();
        expect(jobs.itemCreated.length).toEqual(2);
        expect(jobs.itemCreated[0].body.data.attributes.items.data.length).toEqual(100);
        expect(jobs.itemCreated[1].body.data.attributes.items.data.length).toEqual(30);
    });

    it('should return 10 jobs split with 100 items when provided 50 jobs with 20 items', () => {
        const exampleJobArray: any[] = Array(50)
            .fill('itemCreated')
            .map((x) => ({
                type: x,
                body: {
                    data: {
                        type: 'catalog-item-bulk-create-job',
                        attributes: {
                            items: {
                                data: Array(20)
                                    .fill('test-id')
                                    .map((y) => ({ type: 'catalog-item', id: y })),
                            },
                        },
                    },
                },
            }));
        const jobs: any = groupIntoMaxSizeJobs(exampleJobArray, ['itemCreated'], 'items');
        expect(jobs.itemCreated).toBeDefined();
        expect(jobs.itemCreated.length).toEqual(10);
        expect(jobs.itemCreated.map((x: any) => x.body.data.attributes.items.data.length)).toEqual(Array(10).fill(100));
    });
});
