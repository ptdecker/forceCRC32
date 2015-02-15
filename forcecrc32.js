/**
 * Created by ptdecker on 2015-02-14.
 */

/**
 * JavaScript Implementation of Nayuki Minase's CRC-32 Forcer
 *
 * c.f. http://www.nayuki.io/page/forcing-a-files-crc-to-any-value
 */

"use strict";

/*jslint bitwise: true */  // Yes, we know we are intentionally playing with bitwise operators in this code

// Load needed modules

var fs = require('fs'),
    constants = require('constants');

// Convert 'x' to a signed 32-bit integer treating 'x' as a radix-16 number
// c.f. http://speakingjs.com/es5/ch11.html
function toInt32Radix16(x) {
    return (parseInt(x, 16) | 0);
}

// Convert a signed 32-bit integer 'x' to a radix-16 number
// c.f. http://stackoverflow.com/questions/14890994/javascript-c-style-type-cast-from-signed-to-unsigned
function toRadix16int32(x) {
    return ((x >>> 0).toString(16));
}

// Left pad a string with 32 leading zeros

function pad32zero(x) {
    return ("00000000000000000000000000000000" + x).slice(-32);
}

// Left pad a string with 8 leading zeros

function pad8zero(x) {
    return ("00000000" + x).slice(-8);
}

// Reverse the bits of a 32-bit radix-16 number
// This works by splitting the number into a 32 digit binary string, converting that to an array, reversing the array
// then combining the array together again, and converting the result back to a radix-16 number.

function reverse32radix16(x) {
    return pad8zero(parseInt(pad32zero(parseInt(x, 16).toString(2)).split('').slice().reverse().join(''), 2).toString(16));
}

function main(file, offset, targetCRC32) {

    var chunk,
        readStream;


    // Convert to lower case and strip off any leading '0x' from passed targetCRC32 argument

    targetCRC32 = (targetCRC32.slice(0, 2) === '0x') ? targetCRC32.slice(2).toLowerCase() : targetCRC32.toLowerCase();

    // Validate passed arguments

    if (arguments.length !== 3 || file === undefined || offset === undefined || targetCRC32 === undefined) {
        return new Error("'forcecrc32': must be called with a 'file name', 'offset', and 'targetCRC32' arguments");
    }

    if (typeof offset !== 'number' || (offset % 1) !== 0) {
        // c.f. http://jsperf.com/numbers-and-integers for why above test is used instead of parseInt
        return new Error("'forcecrc32': 'offset' argument is not an integer (" + offset + ")");
    }

    if (offset < 0) {
        return new Error("'forcecrc32': 'offset' argument is not a positive integer value (" + offset + ")");
    }

    if (isNaN(parseInt(targetCRC32, 16))) {
        return new Error("'forcecrc32': 'targetCRC32' argument is not a valid CRC-32 code (" + targetCRC32 + ")");
    }

    if (toRadix16int32(toInt32Radix16(targetCRC32)) !== targetCRC32) {
        return new Error("'forcecrc32': 'targetCRC32' argument is not a valid CRC-32 code (" + targetCRC32 + ")");
    }

    // Reverse the bits in 'targetCRC32' to support big-endian bit endianness

    targetCRC32 = reverse32radix16(targetCRC32);

    console.log(file); // file to modify
    console.log(offset); // offset of bytes to change
    console.log(targetCRC32); // desired CRC-32 value

    // Start reading the stream

    readStream = fs.createReadStream('testfile.txt');

    readStream
        .on('readable', function () {
            do {
                chunk = readStream.read(4); // returns NodeJS buffer
                if (chunk !== null) {
                    console.log(chunk.toString('hex'));
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

}

/**
 * Pass command line parameters to main process and handle any returned errors
 */

var err = main(process.argv[2], parseInt(process.argv[3], 10), process.argv[4]);
if (err) {
    console.error(err.message);
    process.exit(1);
}