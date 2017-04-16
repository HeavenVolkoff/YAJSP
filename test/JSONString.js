'use strict'

import { StringDecoder } from 'string_decoder'

import test from 'tape'
import JSONString from '../src/JSONString'
import { QUOTATION_MARK } from '../src/util/constants'

const substr = (str, init, length) =>
  (init === 0 && length >= str.length
    ? str
    : new StringDecoder('utf8').end(Buffer.from(str.substr(init, length - 3))) +
        '...')

// Valid Test cases
;[
  /* eslint-disable no-useless-escape */
  '"test"',
  // Test solidus
  '"/\/\\/"',
  // Test Numbers
  '"1234567890"',
  // Test letters
  '"qwertyuiop"',
  // Test
  '"áéíóúâêîôûàèìòùãõç"',
  // Test control char
  '"\\b\\f\\n\\r\\t\\\\\\"/"',
  // Test special char
  '"!@#$%^&*()[]{}|/?.,<>:;"',
  // Test Unicode sequence
  '"\\u1234\\u0040\\u0FFe\\u00Ff\\ud012\\uAaEc"',
  // Test reallocation, 140 chars
  '"                                                                                                                                            "',
  // Test emoji
  '"😀😃😄😁😆😅😂🤣☺️😊😇🙂🙃😉😌😍😘😗😙😚😋😜😝😛🤑🤗🤓😎🤡🤠😏😒😞😔😟😕🙁☹️😣😖😫😩😤😠😡😶😐😑😯😦😧😮😲😵😳😱😨😰😢😥🤤😭😓😪😴🙄🤔🤥😬🤐🤢🤧😷🤒🤕😈👿👹👺💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾👐🙌👏🙏🤝👍👎👊✊🤛🤜🤞✌️🤘👌👈👉👆👇☝️✋🤚🖐🖖👋🤙💪🖕✍️🤳💅🖖💄💋👄👅👂👃👣👁👀🗣👤👥👶👦👧👨👩👱‍♀️👱👴👵👲👳‍♀️👳👮‍♀️👮👷‍♀️👷💂‍♀️💂🕵️‍♀️🕵️👩‍⚕️👨‍⚕️👩‍🌾👨‍🌾👩‍🍳👨‍🍳👩‍🎓👨‍🎓👩‍🎤👨‍🎤👩‍🏫👨‍🏫👩‍🏭👨‍🏭👩‍💻👨‍💻👩‍💼👨‍💼👩‍🔧👨‍🔧👩‍🔬👨‍🔬👩‍🎨👨‍🎨👩‍🚒👨‍🚒👩‍✈️👨‍✈️👩‍🚀👨‍🚀👩‍⚖️👨‍⚖️🤶🎅👸🤴👰🤵👼🤰🙇‍♀️🙇💁💁‍♂️🙅🙅‍♂️🙆🙆‍♂️🙋🙋‍♂️🤦‍♀️🤦‍♂️🤷‍♀️🤷‍♂️🙎🙎‍♂️🙍🙍‍♂️💇💇‍♂️💆💆‍♂️🕴💃🕺👯👯‍♂️🚶‍♀️🚶🏃‍♀️🏃👫👭👬💑👩‍❤️‍👩👨‍❤️‍👨💏👩‍❤️‍💋‍👩👨‍❤️‍💋‍👨👪👨‍👩‍👧👨‍👩‍👧‍👦👨‍👩‍👦‍👦👨‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧👩‍👩‍👧‍👦👩‍👩‍👦‍👦👩‍👩‍👧‍👧👨‍👨‍👦👨‍👨‍👧👨‍👨‍👧‍👦👨‍👨‍👦‍👦👨‍👨‍👧‍👧👩‍👦👩‍👧👩‍👧‍👦👩‍👦‍👦👩‍👧‍👧👨‍👦👨‍👧👨‍👧‍👦👨‍👦‍👦👨‍👧‍👧👚👕👖👔👗👙👘👠👡👢👞👟👒🎩🎓👑⛑🎒👝👛👜💼👓🕶🌂☂️"'
  /* eslint-enable no-useless-escape */
].forEach(str =>
  test(`Testing JSONString parser with valid JSON String: ${substr(str, 0, 40)}`, tape => {
    const strBuff = Buffer.from(str.substring(1, str.length - 1))
    const jsonStr = new JSONString(
      (_type, value) =>
        process.nextTick(tape => {
          tape.equal(_type, 'value')
          tape.equal(value, JSON.parse(str))
        }, tape),
      false
    )

    tape.plan(2 + strBuff.length + 1)
    strBuff.forEach(charCode => tape.error(jsonStr.next(charCode)))
    tape.error(jsonStr.next(QUOTATION_MARK))
  })
)

// Invalid Test cases
;[
  { str: '"\b"', errorIndex: 0 },
  { str: '"\f"', errorIndex: 0 },
  { str: '"\n"', errorIndex: 0 },
  { str: '"\r"', errorIndex: 0 },
  { str: '"\t"', errorIndex: 0 },
  { str: '"\\a"', errorIndex: 1 },
  { str: '"\\B"', errorIndex: 1 },
  { str: '"\\R"', errorIndex: 1 },
  { str: '"\\1"', errorIndex: 1 },
  { str: '"\\u"', errorIndex: 2 },
  { str: '"\\u1"', errorIndex: 3 },
  { str: '"\\u12"', errorIndex: 4 },
  { str: '"\\u123"', errorIndex: 5 },
  { str: Buffer.from([0x10, 0x34, 0xfe, 0xff, 0x45, 0x67]), errorIndex: 6 }
].forEach(({ str, errorIndex }) =>
  test(`Testing JSONString parser with valid JSON String: ${substr(str + '', 0, 40)}`, tape => {
    const strBuff = str instanceof Buffer
      ? str
      : Buffer.from(str.substring(1, str.length - 1))
    const jsonStr = new JSONString(
      (_type, value) =>
        process.nextTick(tape => tape.fails('Invalid was accepted'), tape),
      false
    )

    tape.plan(errorIndex + 1)

    let i = -1
    while (++i < errorIndex) {
      tape.error(jsonStr.next(strBuff[i]))
    }

    tape.throws(() => {
      const error = jsonStr.next(strBuff[errorIndex] || QUOTATION_MARK)
      if (error !== null) throw error
    }, SyntaxError)
  })
)

// TODO: Add test reset
// TODO: add realloc limit test
