/**
 * Created by ptdecker on 15-02-14.
 */

// An example of reversing the bits of an unsigned 32-bit integer

/*jslint bitwise: true */  // Yes, we know we are intentionally playing with bitwise operators in this code

"use strict";

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


// Test things out

console.log(reverse32radix16('00000000'));
console.log(reverse32radix16('00000001'));
console.log(reverse32radix16('aaaaaaaa'));
console.log(reverse32radix16('55555555'));
console.log(reverse32radix16('80000000'));
console.log(reverse32radix16('ffffffff'));

console.log(reverse32radix16(reverse32radix16('abcd1234')));

