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
                            items: Array(50).fill({ type: 'catalog-item', id: 'test-id' }),
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
                            items: Array(30).fill({ type: 'catalog-item', id: 'test-id' }),
                        },
                    },
                },
            },
        ];
        const jobs: any = groupIntoMaxSizeJobs(exampleJobArray, ['itemCreated'], 'items');

        expect(jobs.itemCreated).toBeDefined();
        expect(jobs.itemCreated.length).toEqual(1);
        expect(jobs.itemCreated[0].body.data.attributes.items.length).toEqual(80);
    });

    it('should return a two jobs split 100/30 when provided 2 jobs with 80 and 50 items', () => {
        const exampleJobArray: any[] = [
            {
                type: 'itemCreated',
                body: {
                    data: {
                        type: 'catalog-item-bulk-create-job',
                        attributes: {
                            items: Array(80).fill({ type: 'catalog-item', id: 'test-id' }),
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
                            items: Array(50).fill({ type: 'catalog-item', id: 'test-id' }),
                        },
                    },
                },
            },
        ];
        const jobs: any = groupIntoMaxSizeJobs(exampleJobArray, ['itemCreated'], 'items');

        expect(jobs.itemCreated).toBeDefined();
        expect(jobs.itemCreated.length).toEqual(2);
        expect(jobs.itemCreated[0].body.data.attributes.items.length).toEqual(100);
        expect(jobs.itemCreated[1].body.data.attributes.items.length).toEqual(30);
    });
});
