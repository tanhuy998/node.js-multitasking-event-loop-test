const {Worker, isMainThread, threadId} = require('node:worker_threads');

const path = require('node:path');
const {pid} = require('node:process');


if (isMainThread) {

    console.log('main thread id:', threadId);

    require('../temp.js');

    const thread = new Worker(path.join(__dirname, './temp.js'));

    //const child = new child_process.fork(path.join(__dirname, './temp.js'), [pid]);

    thread.on('online', () => {

        console.log('worker thread started');

        // setTimeout(() => {

        //     console.log('worker thread online event');
        // })

        setImmediate(() => {

            console.log('second mainthread checkphase');
        })
    })

    // setImmediate(() => {

    //     console.log('second mainthread checkphase');
    // })
}