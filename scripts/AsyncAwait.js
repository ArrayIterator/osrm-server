module.exports = async (waiting, succeed, timeoutProcessSecond) => {
    if (typeof timeoutProcessSecond === 'number') {
        timeoutProcessSecond = 30;
    }
    if (timeoutProcessSecond < 2) {
        timeoutProcessSecond = 2;
    } else if (timeoutProcessSecond > 60) {
        timeoutProcessSecond = 60;
    }
    let maximum = 100000,
        max = maximum,
        time = new Date().getTime(),
        tick = async (waiting, succeed) => {
            let res;
            let sleep = new Promise((resolve, reject) => {
                if (max <= 0) {
                    let error = new Error(`Call stack limit after ${maximum} exceeded.`);
                    error.code = 422;
                    resolve(error);
                    return;
                }
                if ((new Date().getTime() - time) > timeoutProcessSecond * 1000) {
                    let error = new Error(`Application timed out after ${timeoutProcessSecond} second.`);
                    error.code = 408;
                    resolve(error);
                    return;
                }
                setTimeout(async function () {
                    if (waiting() === true) {
                        resolve(succeed());
                        return;
                    }
                    resolve(await tick(waiting, succeed));
                }, 50);
            });
            res = await sleep;
            return res;
        };

    return await tick(waiting, succeed);
};