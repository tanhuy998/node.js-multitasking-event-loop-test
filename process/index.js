const {Worker, isMainThread, threadId} = require('node:worker_threads');
const child_process = require('node:child_process');
const path = require('node:path');
const {pid} = require('node:process');

console.log('child proccesses');

if (isMainThread) {

    console.log('main thread id:', threadId);

    require('./temp.js');

    //const thread = new Worker(path.join(__dirname, './temp.js'));

    const child = new child_process.fork(path.join(__dirname, './temp.js'), [pid]);

    //thread.on('online', () => {
    child.on('spawn', () => {

        console.log('worker thread started');

        setImmediate(() => {

            console.log('second mainthread checkphase');
        })
    })

    
}