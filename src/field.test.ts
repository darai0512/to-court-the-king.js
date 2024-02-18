import { expect, test } from "vitest";
import Field from "./field";


test.each`
  me | old | expected
  ${[3,3,3,4,5]}| ${[4,4,1,2,3]} | ${1}
  ${[3,3,3,4,5,4,5]}| ${[6,6,6,6,3]} | ${-1}
  ${[3,3,3,4,5]}| ${[3,3,4,6,3,4,6]} | ${0}
  ${[3,3,3,3,5]}| ${[2,2,2,2,1,1,1,1]} | ${1}
  ${[3,3,3,3,5]}| ${[2,2,2,2,1,1,1,1,1]} | ${-1}
`('field._win($me, $old) -> $expected', ({me, old, expected}) => {
  const field = new Field()
  expect(field._win(me, old)).toEqual(expected)
});