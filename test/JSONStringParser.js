'use strict'

import { StringDecoder } from 'string_decoder'

import test from 'tape'
import JSONStringParser from '../src/parsers/JSONStringParser'

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
    const strBuff = Buffer.from(str)
    const jsonStr = new JSONStringParser(
      (_type, value) =>
        process.nextTick(tape => {
          tape.equal(_type, 'value')
          tape.equal(value, JSON.parse(str))
        }, tape),
      false
    )

    tape.plan(2 + strBuff.length)
    tape.equal(jsonStr.open(strBuff[0]), jsonStr)
    let i = 0
    while (++i < strBuff.length) {
      tape.error(jsonStr.next(strBuff[i]))
    }
  })
)

// Invalid Test cases
;[
  { str: '"\b"', errorIndex: 1 },
  { str: '"\f"', errorIndex: 1 },
  { str: '"\n"', errorIndex: 1 },
  { str: '"\r"', errorIndex: 1 },
  { str: '"\t"', errorIndex: 1 },
  { str: '"\\a"', errorIndex: 2 },
  { str: '"\\B"', errorIndex: 2 },
  { str: '"\\R"', errorIndex: 2 },
  { str: '"\\1"', errorIndex: 2 },
  { str: '"\\u"', errorIndex: 3 },
  { str: '"\\u1"', errorIndex: 4 },
  { str: '"\\u12"', errorIndex: 5 },
  { str: '"\\u123"', errorIndex: 6 },
  {
    str: Buffer.from([0x22, 0x10, 0x34, 0xfe, 0xff, 0x45, 0x67, 0x22]),
    errorIndex: 7

  }
].forEach(({ str, errorIndex }) =>
  test(`Testing JSONString parser with invalid JSON String: ${substr(str + '', 0, 40)}`, tape => {
    const strBuff = str instanceof Buffer ? str : Buffer.from(str)
    const jsonStr = new JSONStringParser(
      (_type, value) =>
        process.nextTick(tape => tape.fail('Invalid was accepted'), tape),
      false
    )

    tape.plan(errorIndex + 1)
    tape.equal(jsonStr.open(strBuff[0]), jsonStr)

    let i = 0
    while (++i < errorIndex) {
      tape.error(jsonStr.next(strBuff[i]))
    }

    tape.throws(() => {
      throw jsonStr.next(strBuff[errorIndex])
    }, SyntaxError)
  })
)

// TODO: Add test reset
// TODO: add realloc limit test
