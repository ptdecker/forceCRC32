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
            z = z.xor(x.multiply(y.and(Long.ONE)));
            y = y.shiftRight(1);
            x = x.shiftLeft(1);
            if (!x.and(Long.ONE.shiftLeft(32)).isZero()) {
                x = x.xor(GEN_POLYNOMIAL);
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
                z = multiplyMod(z, x);
            }
            x = multiplyMod(x, x);
            y = y.shiftRight(1);
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
        for (i = (getDegree(x) - yDeg); i >= 0; i -= 1) {
            x = x.xor(y.shiftLeft(i));
            z = z.or(Long.ONE.shiftLeft(i));
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
            y;
        y = new Long.fromValue(x);
        x = new Long.fromValue(GEN_POLYNOMIAL);
        while (!y.isZero()) {
            divRem = divideAndRemainder(x, y);
            c = a.xor(multiplyMod(divRem[0], b));
            x = y;
            y = divRem[1];
            a = b;
            b = c;
        }
        if (x.equals(Long.ONE)) {
            return a;
        }
        return new Error("'reciprocalMod': Reciprocal does not exist");
    }
    return new Error("'reciprocalMod': Passed argument must be of type Long");
}

function main(file, offset, targetCRC32) {

    var readStream,
        writeStream,
        chunk,
        newChunk,
        value,
        fileSize,
        originalCRC,
        newCRC,
        completedCRC,
        delta;

    console.log('hello', targetCRC32.toString(16));

    // Get length of file to be modified

    /*jslint stupid:true */ // Tolerate 'stupid' use of synchronous file read
    fileSize = fs.statSync(file).size;
    console.log("file is " + fileSize);
    /*jslint stupid:false */

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

    if ((offset + 4) > fileSize) {
        return new Error("'forcecrc32': 'offset' plus four bytes " + (offset + 4) + " exceeds file length (" + fileSize + " byte(s))");
    }

    if (Long.isLong(targetCRC32)) {
        newCRC = targetCRC32;
    } else {
        newCRC = new Long.fromString(targetCRC32, false, 16);
    }

    // Reverse the bits in 'targetCRC32' to support big-endian bit endianness

    console.log('before', newCRC.toString(2));
    newCRC = reverseLowBits(newCRC);
    console.log('after ', newCRC.toString(2));


    console.log(file); // file to modify
    console.log(offset); // offset of bytes to change
    console.log(newCRC.toString(16)); // desired CRC-32 value

    // Calculate original CRC-32 value

    /*jslint stupid:true */ // Tolerate 'stupid' use of synchronous file read
    originalCRC = new Long.fromBits(crc.crc32(fs.readFileSync(file, 'utf8')), 0x00000000, true);
    console.log("Original CRC-32: " + originalCRC.toString(16));
    /*jslint stupid:false */

    // Compute the change to make
    delta = originalCRC.xor(newCRC);
    delta = multiplyMod(reciprocalMod(powMod(new Long.fromInt(2), new Long.fromInt((fileSize - offset) * 8))), delta.and(new Long(0xFFFFFFFF, 0x00000000)));

    console.log("Delta: " + delta.toString(16));

    // Patch four bytes in the file with the delta

    readStream = fs.createReadStream(file);
    writeStream = fs.createWriteStream(file + ".new");

    readStream
        .on('readable', function () {
            do {
                chunk = readStream.read(1); // returns NodeJS buffer
                if (chunk !== null) {
                    value = Long.fromString(chunk.toString('hex'), false, 16);
                    offset -= 1;
                    if (offset >= 0) {
                        newChunk = chunk;
                    } else {
                        newChunk = new Buffer("A", 'utf8');
                    }

                    console.log(chunk.toString('hex'), value.toString(16), newChunk, offset);
                    writeStream.write(chunk);
                }
            } while (chunk !== null);
        })
        .on('end', function () {
            console.log('done reading');
            writeStream.end();
        })
        .on('error', function(err) {
            console.log(err);
            process.exit(1);
        });

    writeStream
        .on('finish', function () {
            console.log('new file written');

            // Recheck the patched file

            /*jslint stupid:true */ // Tolerate 'stupid' use of synchronous file read
            completedCRC = new Long.fromBits(crc.crc32(fs.readFileSync(file + ".new", 'utf8')), 0x00000000, true);
            console.log("Final CRC-32: " + completedCRC.toString(16));
            /*jslint stupid:false */

            if (completedCRC.equals(targetCRC32)) {
                console.log("New CRC-32 successfully verified");
            } else {
                console.log("Error: Failed to update CRC-32 to desired value");
            }

        });

}

//
// Pass command line parameters to main process and handle any returned errors
//

var fileName    = process.argv[2],
    offset      = parseInt(process.argv[3], 10),
    targetCRC32 = process.argv[4],
    err;

err = main(fileName, offset, targetCRC32);
if (err) {
    console.error(err.message);
    process.exit(1);
}