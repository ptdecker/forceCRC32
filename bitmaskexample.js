// Here is a shortened set of code that illustrates how to work around JavaScript's limitation of treating 32-bit
// unsigned integers as signed.

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

// The following code produces unexpected (if you don't understand JavaScript's signed 32-bit integers) output:

console.log((parseInt('0xdeadbeef', 16) & parseInt('0x000000ff', 16)).toString(16));
console.log((parseInt('0xdeadbeef', 16) & parseInt('0x0000ff00', 16)).toString(16));
console.log((parseInt('0xdeadbeef', 16) & parseInt('0x00ff0000', 16)).toString(16));
console.log((parseInt('0xdeadbeef', 16) & parseInt('0xff000000', 16)).toString(16));
console.log((parseInt('0xdeadbeef', 16) & parseInt('0x000000ff', 16)).toString(16));
console.log((parseInt('0xdeadbeef', 16) & parseInt('0x0000ffff', 16)).toString(16));
console.log((parseInt('0xdeadbeef', 16) & parseInt('0x00ffffff', 16)).toString(16));
console.log((parseInt('0xdeadbeef', 16) & parseInt('0xffffffff', 16)).toString(16));

// The following code produces output that I would expect to see:

console.log(toRadix16int32(toInt32Radix16('0xdeadbeef') & toInt32Radix16('0x000000ff')));
console.log(toRadix16int32(toInt32Radix16('0xdeadbeef') & toInt32Radix16('0x0000ff00')));
console.log(toRadix16int32(toInt32Radix16('0xdeadbeef') & toInt32Radix16('0x00ff0000')));
console.log(toRadix16int32(toInt32Radix16('0xdeadbeef') & toInt32Radix16('0xff000000')));
console.log(toRadix16int32(toInt32Radix16('0xdeadbeef') & toInt32Radix16('0x000000ff')));
console.log(toRadix16int32(toInt32Radix16('0xdeadbeef') & toInt32Radix16('0x0000ffff')));
console.log(toRadix16int32(toInt32Radix16('0xdeadbeef') & toInt32Radix16('0x00ffffff')));
console.log(toRadix16int32(toInt32Radix16('0xdeadbeef') & toInt32Radix16('0xffffffff')));
