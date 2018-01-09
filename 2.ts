import { readFileSync, writeFileSync } from "fs";

// byte ":" = 58; "i" = 105;

const eChar = "e".charCodeAt(0);
const iChar = "i".charCodeAt(0);
const colonChar = ":".charCodeAt(0);
const dChar = "d".charCodeAt(0);
const lChar = "l".charCodeAt(0);

const fileContent = readFileSync("./test3.torrent", { encoding: "utf-8" })
const buffers: Buffer = Buffer.from(fileContent)
const maxLength = buffers.length
console.info("length", maxLength, fileContent.length)
let pos = 0;

enum SetStack {
    D, LL, L
}

const setStack: SetStack[] = []

// const buffers = Buffer.from(fileContent, "utf-8").entries()

// function test(dict) {
//     writeFileSync("test.json", JSON.stringify(dict))
// }

function get_dict() {
    const dict = {}
    while (true) {
        const key = get_val()
        if (!key) {
            console.info("end" + pos)
            break
        }
        const val = get_val()
        dict[key] = val
    }
    return dict
}

function get_str() {
    const str_len = get_length()
    const buffers = Buffer.alloc(str_len);
    for (let i = 0; i < str_len; i++) {
        buffers[i] = view_buffer(i)
    }
    reset_pos(str_len)
    return buffers.toString()
}

function get_num(): number {
    let _int = 0
    while (true) {
        const buffer = next_buffer()
        if (judge_number(buffer)) {
            _int *= 10
            _int += buffer - 0x30
        } else if (buffer === eChar) {
            break
        } else {
            throw new Error("she me gui " + pos + " " + Buffer.from([buffer]).toString())
        }
    }
    return _int
}

function get_list(char?: string) {
    const list = []
    while (true) {
        const val = get_val()
        if (val) {
            list.push(val)
        } else {
            break
        }
    }
    return list
}

function get_length(): number {
    let strLen = 0
    while (true) {
        const buffer: number = next_buffer()
        if (judge_number(buffer)) {
            strLen *= 10
            strLen += buffer - 0x30
        } else if (buffer === colonChar) {
            break
        } else {
            throw new Error("she me gui " + pos + " " + Buffer.from([buffer]).toString())
        }
    }
    return strLen
}

function judge_number(buffer) {
    if (typeof buffer !== 'number') {
        return false
    }
    return (0x30 <= buffer && buffer <= 0x39)
}

function next_buffer(): number {
    const buffer = buffers[pos]
    reset_pos(1)
    return buffer
}

function view_buffer(offet: number = 0) {
    return buffers[pos + offet]
}

function reset_pos(offset: number): void {
    pos += offset
}

function get_val() {
    const v_buffer = next_buffer()
    console.info("abc", v_buffer)
    switch (true) {
        case 0x30 <= v_buffer && v_buffer <= 0x39:
            reset_pos(-1)
            return get_str()
        case v_buffer === dChar:
            setStack.push(SetStack.D)
            return get_dict()
        case v_buffer === iChar:
            return get_num()
        case v_buffer === lChar && view_buffer() === lChar:
            reset_pos(1); setStack.push(SetStack.LL)
            return get_list()
        case v_buffer === lChar:
            setStack.push(SetStack.L)
            return get_list()
        case v_buffer === eChar && view_buffer() === lChar && setStack.slice(-1)[0] === SetStack.LL:
            console.info(pos, "el")
            reset_pos(1)
            return get_val()
        case v_buffer === eChar && setStack.slice(-1)[0] === SetStack.L:
            console.info(pos, "l end")
            setStack.pop()
            return 0
        case v_buffer === eChar && view_buffer() === eChar && setStack.slice(-1)[0] === SetStack.LL:
            console.info(pos, "ll end")
            setStack.pop()
            reset_pos(1)
            return 0
        case v_buffer === eChar && setStack.slice(-1)[0] === SetStack.D:
            setStack.pop()
            return 0
    }
}

const paser_content = JSON.stringify(get_val())
// console.info(paser_content)

// for(let f of fileContent){
// let a = 0
// for (let f of buffers) {
//     if (f > 177) {
//         a += 1
//         console.info(f)
//     }
// }
console.info(paser_content)
// }
// writeFileSync("filecontent.txt", fileContent.toString(), { encoding: "utf-8" })
writeFileSync("result.json", paser_content, { encoding: "utf-8" })


const b = Buffer.from([1,2,3]   ).toString()