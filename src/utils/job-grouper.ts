export const groupIntoMaxSizeJobs = (inputArray: KlaviyoEvent[], resultArrayKeys: string[], elementKey: string): maxSizeJobArrayContainer => {
    const resultArrays: maxSizeJobArrayContainer = {};

    resultArrayKeys.forEach(key => {
        resultArrays[key] = [] as KlaviyoEvent[];
    });

    inputArray.forEach((event: any) => {
        const lastEvent: any = resultArrays[event.type].slice(-1)[0];
        if (lastEvent) {
            if (lastEvent.body.data.attributes[elementKey].length < 100) {
                const elements = [
                    ...chunks(
                        lastEvent.body.data.attributes[elementKey].concat(
                            event.body.data.attributes[elementKey],
                        ),
                        100,
                    ),
                ];
                lastEvent.body.data.attributes[elementKey] = elements[0];
                if (elements[1]) {
                    resultArrays[event.type].push({
                        type: event.type,
                        body: {
                            data: {
                                attributes: {
                                    [elementKey]: elements[1],
                                },
                                type: event.body.data.type,
                            },
                        },
                    });
                }
            }
        } else {
            resultArrays[event.type].push(event);
        }
    });

    return resultArrays;
};

function *chunks<T>(arr: T[], n: number): Generator<T[], void> {
    for (let i = 0; i < arr.length; i += n) {
        yield arr.slice(i, i + n);
    }
}