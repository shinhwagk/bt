const fs = require("fs")
var bencode = require('bencode')


var torrent = fs.readFileSync('test3.torrent')


const p = bencode.decode(Buffer.from(torrent))
console.info(p)
