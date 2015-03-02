/**
 * Created by ptdecker on 15-03-01.
 */

// Test to see if the 'Long' library passes by reference or by value;

"use strict";

var Long = require('long');

function changeStuff(x) {
    var y = x.and(new Long('0xFF00FF00'));
    console.log(x.toString(16), y.toString(16));
    x = y;
    console.log(x.toString(16), y.toString(16));
    return y;
}

var a = new Long(0xdeadbeef),
    b = new Long(0x00);

console.log('hello world');

console.log(a.toString(16), b.toString(16));
b = changeStuff(a);
console.log(a.toString(16), b.toString(16));

