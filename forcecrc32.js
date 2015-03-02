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
    crc = require('crc'),
    Long = require('long'),
    GEN_POLYNOMIAL = new Long(0x04C11DB7, 0x00000001);

// Left pad a string with 32 leading zeros

function pad32zero(x) {
    return ("00000000000000000000000000000000" + x).slice(-32);
}

// Left pad a string with 8 leading zeros

function pad8zero(x) {
    return ("00000000" + x).slice(-8);
}

// Reverse the lower 32-bits of a 64-bit unsigned integer

function reverseLowBits(x) {
    if(Long.isLong(x)) {
        var y = x.shiftRight( 1).and(new Long(0x55555555)).or(x.and(new Long(0x55555555)).shiftLeft( 1));
        y = y.shiftRight( 2).and(new Long(0x33333333)).or(y.and(new Long(0x33333333)).shiftLeft( 2));
        y = y.shiftRight( 4).and(new Long(0x0f0f0f0f)).or(y.and(new Long(0x0f0f0f0f)).shiftLeft( 4));
        y = y.shiftRight( 8).and(new Long(0x00ff00ff)).or(y.and(new Long(0x00ff00ff)).shiftLeft( 8));
        y = y.shiftRight(16).and(new Long(0x0000ffff)).or(y.and(new Long(0x0000ffff)).shiftLeft(16));
        return y;
    }
    return new Error("'reverseLowBits': Passed argument must be of type Long");
}

/**
 *  --- START OF 64-BIT UNSIGNED POLYNOMIAL ARITHMETIC FUNCTIONS ---
 */

// Returns polynomial x multiplied by polynomial y modulo the generator polynomial.
//
// Utilizes the 'Russian Peasant' multiplication algorithm
// c.f. http://en.wikipedia.org/wiki/Ancient_Egyptian_multiplication
//      https://www.youtube.com/watch?v=xrUCL7tGKaI

function multiplyMod(x, y) {
    if(Long.isLong(x) && Long.isLong(y)) {
        var z = Long.ZERO;
        while (!y.isZero()) {
            z.xor(y.and(Long.ONE).multiply(x));
            y.shiftRight(1);
            x.shiftLeft(1);
            if (!x.and(Long.ONE.shiftLeft(32)).isZero()) {
                x.xor(GEN_POLYNOMIAL);
            }
        }
        return z;
    }
    return new Error("'multiplyMod': Passed arguments must be of type Long");
}

// Returns polynomial x to the power of natural number y modulo the generator polynomial.

function powMod(x, y) {
    if(Long.isLong(x) && Long.isLong(y)) {
        var z = Long.ONE;
        while (!y.isZero()) {
            if (!y.and(Long.ONE).isZero()) {
                z = multiplyMod(x, y);
            }
            x = multiplyMod(x, x);
            y.shiftRight(1);
        }
        return z;
    }
    return new Error("'powMod': Passed arguments must be of type Long");
}

// I believe this emulates Java's java.lang.Long.numberOfLeadingZeros() method that Nayuki Minase calls from her
// 'getDegree()' method

function javaNumberOfLeadingZeros(x) {
    if(Long.isLong(x)) {
        return 64 - (x.isZero() ? 0 : x.getNumBitsAbs());
    }
    return new Error("'javaNumberOfLeadingZeros': Passed argument must be of type Long");
}

// I believe this emulates the 'getDegree' function as defined by Nayuki Minase.

function getDegree(x) {
    if(Long.isLong(x)) {
        return 63 - javaNumberOfLeadingZeros(x);
    }
    return new Error("'getDegree': Passed argument must be of type Long");
}

// Computes polynomial x divided by polynomial y, returning the quotient and remainder.

function divideAndRemainder(x, y) {
    if(Long.isLong(x) && Long.isLong(y)) {
        if (y.isZero()) {
            return new Error("'divideAndRemainder': Attemped to divide by zero");
        }
        if (x.isZero()) {
            return [Long.ZERO, Long.ZERO];
        }
        var yDeg = getDegree(y),
            z = Long.ZERO,
            i;
        for (i = (getDegree(x) - yDeg); i >= 0; i -= 0) {
            x.xor(y.shiftLeft(i));
            z.or(Long.ONE.shiftLeft(i));
        }
        return [z, x];
    }
    return new Error("'divideAndRemainder': Passed arguments must be of type Long");
}

// Returns the reciprocal of polynomial x with respect to the generator polynomial
//
// Based on a simplification of the extended Euclidean algorithm

function reciprocalMod(x) {
    if(Long.isLong(x)) {
        var divRem = [],
            a = Long.ZERO,
            b = Long.ONE,
            c,
            y = new Long(x.getLowBitsUnsigned(), x.getHighBitsUnsigned());
        x = new Long(GEN_POLYNOMIAL.getLowBitsUnsigned(), GEN_POLYNOMIAL.getHighBitsUnsigned());
        while (!y.isZero()) {
            divRem = divideAndRemainder(x, y);
            c = a.xor(multiplyMod(divRem[0], b));
            x = y;
            y = divRem[1];
            a = b;
            b = c;
        }
        if (x === 1) {
            return a;
        }
        return new Error("'reciprocalMod': Reciprocal does not exist");
    }
    return new Error("'reciprocalMod': Passed argument must be of type Long");
}

function main(file, offset, targetCRC32) {

    var chunk,
        value,
        readStream;

    console.log('hello', targetCRC32.toString(16));

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

    // Reverse the bits in 'targetCRC32' to support big-endian bit endianness

    console.log('before', targetCRC32.toString(2));
    targetCRC32 = reverseLowBits(targetCRC32);
    console.log('after ', targetCRC32.toString(2));

    console.log(file); // file to modify
    console.log(offset); // offset of bytes to change
    console.log(targetCRC32.toString(16)); // desired CRC-32 value

    // Start reading the stream

    readStream = fs.createReadStream('testfile.txt');

    readStream
        .on('readable', function () {
            do {
                chunk = readStream.read(4); // returns NodeJS buffer
                if (chunk !== null) {
                    value = Long.fromString(chunk.toString('hex'), false, 16);
                    console.log(chunk.toString('hex'), value.toString(16));
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

//
// Pass command line parameters to main process and handle any returned errors
//


var fileName = process.argv[2],
    offset = parseInt(process.argv[3], 10),
    targetCRC32 = Long.fromString(process.argv[4], false, 16);


console.log(crc.crc32(fs.readFileSync(fileName, 'utf8')).toString(16));


/*
var err = main(fileName, offset, targetCRC32);
if (err) {
    console.error(err.message);
    process.exit(1);
}
*/