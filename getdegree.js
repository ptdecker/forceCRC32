/**
 * Created by ptdecker on 15-03-01.
 */

// Tests the getDegree function

"use strict";

var Long = require('long');



function getDegree(x) {
    if(Long.isLong(x)) {
        return 63 - (64 - (x.isZero() ? 0 : x.getNumBitsAbs()));
    }
    return new Error("'getDegree': Passed argument must be of type Long");
}

console.log(getDegree(new Long(0x00000000)));
console.log(getDegree(new Long(0x00000001)));
console.log(getDegree(new Long(0x00000002)));
console.log(getDegree(new Long(0x00000004)));
console.log(getDegree(new Long(0x00000008)));
console.log(getDegree(new Long(0x00000010)));
console.log(getDegree(new Long(0x00000020)));
console.log(getDegree(new Long(0x00000040)));
console.log(getDegree(new Long(0x00000080)));
console.log(getDegree(new Long(0x00000100)));
console.log(getDegree(new Long(0x00000200)));
console.log(getDegree(new Long(0x00000400)));
console.log(getDegree(new Long(0x00000800)));
console.log(getDegree(new Long(0x00001000)));
console.log(getDegree(new Long(0x00002000)));
console.log(getDegree(new Long(0x00004000)));
console.log(getDegree(new Long(0x00008000)));
console.log(getDegree(new Long(0x00010000)));
console.log(getDegree(new Long(0x00020000)));
console.log(getDegree(new Long(0x00040000)));
console.log(getDegree(new Long(0x00080000)));
console.log(getDegree(new Long(0x00100000)));
console.log(getDegree(new Long(0x00200000)));
console.log(getDegree(new Long(0x00400000)));
console.log(getDegree(new Long(0x00800000)));
console.log(getDegree(new Long(0x01000000)));
console.log(getDegree(new Long(0x02000000)));
console.log(getDegree(new Long(0x04000000)));
console.log(getDegree(new Long(0x08000000)));
console.log(getDegree(new Long(0x10000000)));
console.log(getDegree(new Long(0x20000000)));
console.log(getDegree(new Long(0x40000000)));
console.log(getDegree(new Long(0x80000000)));
console.log(getDegree(new Long(0x00000000, 0x00000001)));
console.log(getDegree(new Long(0x00000000, 0x00000002)));
console.log(getDegree(new Long(0x00000000, 0x00000004)));
console.log(getDegree(new Long(0x00000000, 0x00000008)));
console.log(getDegree(new Long(0x00000000, 0x00000010)));
console.log(getDegree(new Long(0x00000000, 0x00000020)));
console.log(getDegree(new Long(0x00000000, 0x00000040)));
console.log(getDegree(new Long(0x00000000, 0x00000080)));
console.log(getDegree(new Long(0x00000000, 0x00000100)));
console.log(getDegree(new Long(0x00000000, 0x00000200)));
console.log(getDegree(new Long(0x00000000, 0x00000400)));
console.log(getDegree(new Long(0x00000000, 0x00000800)));
console.log(getDegree(new Long(0x00000000, 0x00001000)));
console.log(getDegree(new Long(0x00000000, 0x00002000)));
console.log(getDegree(new Long(0x00000000, 0x00004000)));
console.log(getDegree(new Long(0x00000000, 0x00008000)));
console.log(getDegree(new Long(0x00000000, 0x00010000)));
console.log(getDegree(new Long(0x00000000, 0x00020000)));
console.log(getDegree(new Long(0x00000000, 0x00040000)));
console.log(getDegree(new Long(0x00000000, 0x00080000)));
console.log(getDegree(new Long(0x00000000, 0x00100000)));
console.log(getDegree(new Long(0x00000000, 0x00200000)));
console.log(getDegree(new Long(0x00000000, 0x00400000)));
console.log(getDegree(new Long(0x00000000, 0x00800000)));
console.log(getDegree(new Long(0x00000000, 0x01000000)));
console.log(getDegree(new Long(0x00000000, 0x02000000)));
console.log(getDegree(new Long(0x00000000, 0x04000000)));
console.log(getDegree(new Long(0x00000000, 0x08000000)));
console.log(getDegree(new Long(0x00000000, 0x10000000)));
console.log(getDegree(new Long(0x00000000, 0x20000000)));
console.log(getDegree(new Long(0x00000000, 0x40000000)));
console.log(getDegree(new Long(0x00000000, 0x80000000)));

