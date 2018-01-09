"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
// byte ":" = 58; "i" = 105;
var eChar = "e".charCodeAt(0);
var iChar = "i".charCodeAt(0);
var colonChar = ":".charCodeAt(0);
var dChar = "d".charCodeAt(0);
var lChar = "l".charCodeAt(0);
var fileContent = Buffer.from(fs_1.readFileSync("./test3.torrent", { encoding: "utf-8" }));
var maxLength = fileContent.length;
var pos = 0;
// const buffers = Buffer.from(fileContent, "utf-8").entries()
// function test(dict) {
//     writeFileSync("test.json", JSON.stringify(dict))
// }
function get_dict() {
    var dict = {};
    while (true) {
        var key = get_val();
        if (!key) {
            console.info("end" + pos);
            break;
        }
        var val = get_val();
        dict[key] = val;
    }
    return dict;
}
function get_str() {
    var str_len = get_length();
    var buffers = Buffer.alloc(str_len);
    for (var i = 0; i < str_len; i++) {
        buffers[i] = view_buffer(i);
    }
    reset_pos(str_len);
    return buffers.toString();
}
function get_num() {
    var _int = 0;
    while (true) {
        var buffer = next_buffer();
        if (judge_number(buffer)) {
            _int *= 10;
            _int += buffer - 0x30;
        }
        else if (buffer === eChar) {
            break;
        }
        else {
            throw new Error("she me gui " + pos + " " + Buffer.from([buffer]).toString());
        }
    }
    return _int;
}
function get_list(char) {
    var list = [];
    while (true) {
        var val = get_val();
        if (val) {
            list.push(val);
        }
        else {
            break;
        }
    }
    return list;
}
function get_length() {
    var strLen = 0;
    while (true) {
        var buffer = next_buffer();
        if (judge_number(buffer)) {
            strLen *= 10;
            strLen += buffer - 0x30;
        }
        else if (buffer === colonChar) {
            break;
        }
        else {
            throw new Error("she me gui " + pos + " " + Buffer.from([buffer]).toString());
        }
    }
    return strLen;
}
function judge_number(buffer) {
    if (typeof buffer !== 'number') {
        return false;
    }
    return (0x30 <= buffer && buffer <= 0x39);
}
function next_buffer() {
    var buffer = fileContent[pos];
    reset_pos(1);
    return buffer;
}
function view_buffer(offet) {
    if (offet === void 0) { offet = 0; }
    return fileContent[pos + offet];
}
function reset_pos(offset) {
    pos += offset;
}
function get_val() {
    var v_buffer = next_buffer();
    console.info("abc", v_buffer);
    switch (true) {
        case 0x30 <= v_buffer && v_buffer <= 0x39:
            reset_pos(-1);
            return get_str();
        case v_buffer === dChar:
            return get_dict();
        case v_buffer === iChar:
            return get_num();
        case v_buffer === lChar && view_buffer() === lChar:
            console.info("lll");
            reset_pos(1);
        case v_buffer === lChar:
            console.info("l", pos, Buffer.from([view_buffer(1)]).toString());
            return get_list();
        case v_buffer === eChar && view_buffer() === lChar:
            console.info(pos, "el");
            reset_pos(1);
            return get_val();
        case v_buffer === eChar && view_buffer() === eChar:
            console.info(pos, "ee");
            reset_pos(1);
            return 0;
        case v_buffer === eChar:
            return 0;
    }
}
console.info(get_val()["info"]["files"]);
