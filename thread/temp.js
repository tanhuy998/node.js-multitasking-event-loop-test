const {isMainThread, threadId} = require('node:worker_threads');
const {pid} = require('node:process');


setImmediate(() => {

    console.log('first check phase, thread id:', threadId, pid);
})

setInterval(() => {

    console.log(isMainThread ? 'mainthread interval' : 'worker interval');
    //console.log(isChildProcess? 'child interval' : 'main interval');

    // setImmediate(() => {

    //     console.log('check phase, thread id:', threadId, pid)
    // })
}, 0)