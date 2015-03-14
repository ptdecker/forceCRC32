## forceCRC32

A port of Nayuki Minase's CRC-32 Forcer to JavaScript in a Node.js runtime environment

Credit goes to [Nayuki Minase] (http://www.nayuki.io/) for her [excellent article] (http://www.nayuki.io/page/forcing-a-files-crc-to-any-value)
on how to force a particular CRC-32 code by manipulating four bytes in the target file. Nayuki provides Python and Java example
code in her article. So, I thought I'd contribute a NodeJS JavaScript version for the curious. As an aside, it is really nice to
see her [Project Euler] (https://projecteuler.net/) solutions on her [Github] (https://github.com/nayuki/Project-Euler-solutions).

## Handling 64-bit Integers

JavaScript, by nature, stores all numbers as [double-precision IEEE 754 floating point numbers] (http://steve.hollasch.net/cgindex/coding/ieeefloat.html). The 52 bits of the
fractional portion is used to store integers. This results in '[maximum safe integer] (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)' of
2^53 - 1. While this is in theory enough to store the 40-bit generating function Nayuki uses, JavaScript's bitwise operators
only deal with the lowest 32 bits of JavaScript's 54-bit integers. Since 40-bit generating function exceeds this, we need
an augmented approach. To get us around this issue, this JavaScript implementation utilizes Daniel Wirtz's 'long.js' long class
for representing 64-bit two's-complement integer values. See [his GitHub repository] (https://github.com/dcodeIO/Long.js) for
more information.

## Files

* 'forcecrc32.js' is the work-in-progress NodeJS JavaScript code being developed
* 'testfile.txt' is a file to use for testing things
* '\testscripts' contains a bunch of JavaScript test code to explore various parts, pieces, and libraries as I
test things out.

## Port Questions

1. Did I get Nayuki's 'getDegree()' properly translated?
1. Nayuki has validity tests built in to check for a valid target CRC. The Long library does not seem to provide the same
level of checks so I'm unsure what to put in place
1. Endianness - the crc value returned by the node-crc library matches iHex's CRC32B value instead of CRC32 and has opposite endianness


