/**
 * Created by ptdecker on 15-03-01.
 */

"use strict";

var fs = require('fs'),
    crc = require('crc');

console.log(crc.crc32(fs.readFileSync("testfile.txt", 'utf8')).toString(16));
