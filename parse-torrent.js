var parseTorrentFile = require('parse-torrent-file')
var path = require('path')
var fs = require('fs')
var torrent = fs.readFileSync(path.join('test3.torrent'))
var parsed
try {
  parsed = parseTorrentFile(torrent)
} catch (e) {
  // the torrent file was corrupt
  console.error(e)
}

console.log(parsed) // Prints "Leaves of Grass by Walt Whitman.epub"