export const delaySeconds = async (timeInSeconds: number) => {
	await new Promise((resolve) => {
        setTimeout(resolve, timeInSeconds * 1000);
    });
};