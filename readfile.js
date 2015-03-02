/**
 * Created by ptdecker on 15-02-15.
 */

/**
 * Demonstration of:
 *  a) reading in a file in binary into a 64-bit unsigned data structure
 *  b) storing a forty-bit value (the generator polynomial used by forceCRC32 into a 64-bit unsigned data structure
 *  c) it also shows attempting to store the forty-bit value in a traditional JavaScript Int
 *
 * This demo uses the 'long.js' package for 64-bit unsigned ints (https://github.com/dcodeIO/Long.js)
 */

"use strict";

/*jslint bitwise:true */

var fs = require('fs'),
    Long = require('long'),
    chunk,
    value,
    readStream,
    GEN_POLYNOMIAL = parseInt('0x104C11DB7', 16) | 0,
    GEN_POLYNOMIAL2 = new Long(0x04C11DB7, 0x00000001);

// Left pad a string with 40 leading zeros

function pad40zero(x) {
    return ("0000000000000000000000000000000000000000" + x).slice(-40);
}


// Left pad a string with 8 leading zeros

function pad8zero(x) {
    return ("00000000" + x).slice(-8);
}

console.log(pad40zero(GEN_POLYNOMIAL.toString(2)), ' <-- wrong');
console.log(pad40zero(GEN_POLYNOMIAL2.toString(2)), ' <-- right');

readStream = fs.createReadStream('testfile.txt');


readStream
    .on('readable', function () {
        do {
            chunk = readStream.read(1); // returns NodeJS buffer
            if (chunk !== null) {
                value = Long.fromInt(chunk.toString().charCodeAt(0));
                console.log(pad8zero(parseInt(chunk.toString('hex'), 16).toString(2)), pad8zero(value.toString(2)));
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
