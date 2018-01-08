const I = 'i'.charCodeAt(0)
const L = 'l'.charCodeAt(0)
const E = 'e'.charCodeAt(0)
const D = 'd'.charCodeAt(0)
const COLON = ':'.charCodeAt(0)

const ASCII_0 = 0x30
const ASCII_1 = 0x31
// const DASH = '-'.charCodeAt(0)


let depth = 0
enum PROC_STATE {
    INITIAL, STRING_LEN, STRING, COLON, INTEGER

}

enum LIST_BOUNDARY {
    LL, L
}

const buffer: Buffer = new Buffer("buffer", 'utf8')

let STATE: PROC_STATE = PROC_STATE.INITIAL
let pos: number = -1
let LIST_B;

class Context {
    DICTIONARY_START = {}
    LIST_START = {}

    stack = []

    cb(o) {
        this.stack.push(o)
    }
    cb_list() {
        this.cb(this.LIST_START)
    }
    cb_dict() {
        this.cb(this.DICTIONARY_START)
    }

    cb_end() {
        let obj = null
        const tmp_stack = []

        while ((obj = this.stack.pop()) !== undefined) {
            if (this.LIST_START === obj) {
                var obj2 = null
                var list = []
                while ((obj2 = tmp_stack.pop()) !== undefined) {
                    list.push(obj2)
                }
                this.cb(list)
                break
            } else if (this.DICTIONARY_START === obj) {
                var key = null
                var val = null
                var dic = {}
                while ((key = tmp_stack.pop()) !== undefined && (val = tmp_stack.pop()) !== undefined) {
                    dic[key.toString()] = val
                }

                if (key !== undefined && dic[key] === undefined) {
                    throw new Error('uneven number of keys and values A')
                }
                this.cb(dic)
                break
            } else {
                tmp_stack.push(obj)
            }
        }
        if (tmp_stack.length > 0) {
            // could this case even occur?
            throw new Error('uneven number of keys and values B')
        }
    }
    result() {
        return this.stack
    }
}

const ctx = new Context()

function judge_number(value) {
    if (typeof value !== 'number') {
        return false
    }
    return (0x30 <= value && value <= 0x39)
}


function process_state_initial() {
    switch (buffer[pos]) {
        case 0x30 || 0x31 || 0x32 || 0x33 || 0x34 || 0x35 || 0x36 || 0x37 || 0x38 || 0x39:
            process_state_initial_for_number()
            break
        case D:
            STATE = PROC_STATE.INITIAL
            depth += 1
            ctx.cb_dict()
            break
        case L:
            LIST_B = LIST_BOUNDARY.L
            if (buffer[pos++] === L) {
                pos += 1
                LIST_B = LIST_BOUNDARY.LL
            }
            depth += 1
            ctx.cb_list()
            break
        case E:
            if (LIST_B === LIST_BOUNDARY.LL && buffer[pos + 1] === E || LIST_B === LIST_BOUNDARY.L) {
                depth -= 1
                if (depth < 0) {
                    throw new Error('end with no beginning: ' + pos)
                } else {
                    ctx.cb_end()
                }
                LIST_B = LIST_BOUNDARY.L
            }

            if (LIST_B === LIST_BOUNDARY.LL && (buffer[pos + 1] === L || buffer[pos + 1] === E)) {
                pos += 1
            }

            break
    }

}
function process_state_initial_for_number() {
    let strLen = 0
    while (true) {
        const val: number = buffer[pos]
        if (judge_number(val)) {
            strLen *= 10
            strLen += val - 0x30
            pos += 1
        } else {
            pos -= 1
            break
        }
    }

    const str = new Buffer(strLen)
    for (let i = 0; i < strLen; i++) {
        pos += i
        str[i] = buffer[pos]
    }
    ctx.cb(str)
}




while ((pos++) !== buffer.length) {
    switch (STATE) {
        case PROC_STATE.INITIAL:
            process_state_initial()
            break

    }
}



