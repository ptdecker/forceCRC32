/**
 * Created by ptdecker on 15-02-15.
 */

"use strict";

/*jslint bitwise:true */

var fs = require('fs'),
    chunk,
    readStream,
    GEN_POLYNOMIAL = parseInt('0x104C11DB7', 16) | 0;

// Left pad a string with 40 leading zeros

function pad40zero(x) {
    return ("0000000000000000000000000000000000000000" + x).slice(-40);
}


// Left pad a string with 8 leading zeros

function pad8zero(x) {
    return ("00000000" + x).slice(-8);
}

console.log(pad40zero(GEN_POLYNOMIAL.toString(2))x`);

readStream = fs.createReadStream('testfile.txt');


readStream
    .on('readable', function () {
        do {
            chunk = readStream.read(1); // returns NodeJS buffer
            if (chunk !== null) {
                console.log(pad8zero(parseInt(chunk.toString('hex'), 16).toString(2)));
            }
        } while (chunk !== null);
    })
    .on('end', function () {
        console.log('done');
    })
    .on('error', function(err) {
        console.log(err);
        process.exit(1);
    });
