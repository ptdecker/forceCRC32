/**
 * Created by ptdecker on 2015-02-14.
 */

/**
 * JavaScript Implementation of Nayuki Minase's CRC-32 Forcer
 *
 * c.f. http://www.nayuki.io/page/forcing-a-files-crc-to-any-value
 */

"use strict";

console.log(process.argv[2]); // file to modify
console.log(process.argv[3]); // offset of bytes to change
console.log(process.argv[4]); // desired CRC-32 value
