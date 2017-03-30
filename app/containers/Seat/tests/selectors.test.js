import { fromJS } from 'immutable';
import EWT from 'ethereum-web-token';

import {
  makeLastReceiptSelector,
  makeFoldedSelector,
  makeLastAmountSelector,
  makeCardsSelector,
} from '../selectors';

const ABI_FOLD = [{ name: 'fold', type: 'function', inputs: [{ type: 'uint' }, { type: 'uint' }] }];
const ABI_BET = [{ name: 'bet', type: 'function', inputs: [{ type: 'uint' }, { type: 'uint' }] }];

// secretSeed: 'rural tent tests net drip fatigue uncle action repeat couple lawn rival'
const P1_ADDR = '0x6d2f2c0fa568243d2def3e999a791a6df45d816e';
const P1_KEY = '0x2e39143576f97f6ecd7439a0678f330d7144110cdc58b6476687cc243d7753ca';

// secretSeed: 'engine bargain deny liberty girl wedding plug valley pig admit kiss couch'
const P2_ADDR = '0x1c5a1730ffc44ac21700bb85bf0ceefd12ce71d7';
const P2_KEY = '0x99e69145c6e7f44ba04d579faac9ef4ce5e942dc02b96a9d42b5fcb03e508729';

const TBL_ADDR = '0x77aabb1133';

describe('lastReceiptSelector', () => {
  it('should select correct last action', () => {
    const mockedState = fromJS({
      table: {
        [TBL_ADDR]: {
          0: {
            state: 'flop',
            lineup: [{
              address: P1_ADDR,
            }, {
              address: P2_ADDR,
              last: new EWT(ABI_FOLD).fold(1, 500).sign(P2_KEY),
            }],
          },
        },
      },
    });

    const props = {
      pos: 1,
      params: {
        tableAddr: TBL_ADDR,
        handId: 0,
      },
    };
    const receiptSelector = makeLastReceiptSelector();
    expect(receiptSelector(mockedState, props)).toEqual(EWT.parse(new EWT(ABI_FOLD).fold(1, 500).sign(P2_KEY)));
  });
});

describe('lastAmountSelector', () => {
  it('should calcluate correct last amount with maxbet', () => {
    const mockedState = fromJS({
      table: {
        [TBL_ADDR]: {
          0: {
            state: 'flop',
            lineup: [{
              address: P1_ADDR,
            }, {
              address: P2_ADDR,
              last: new EWT(ABI_BET).bet(1, 1500).sign(P2_KEY),
            }],
            lastRoundMaxBet: 1000,
          },
        },
      },
    });

    const props = {
      pos: 1,
      params: {
        tableAddr: TBL_ADDR,
        handId: 0,
      },
    };
    const lastAmountSelector = makeLastAmountSelector();
    expect(lastAmountSelector(mockedState, props)).toEqual(500);
  });
});

describe('foldedSelector', () => {
  it('should return true for folded pos', () => {
    const mockedState = fromJS({
      table: {
        [TBL_ADDR]: {
          0: {
            state: 'flop',
            lineup: [{
              address: P1_ADDR,
            }, {
              address: P2_ADDR,
              last: new EWT(ABI_FOLD).fold(1, 500).sign(P2_KEY),
            }],
          },
        },
      },
    });

    const props = {
      pos: 1,
      params: {
        tableAddr: TBL_ADDR,
        handId: 0,
      },
    };
    const foldedSelector = makeFoldedSelector();
    expect(foldedSelector(mockedState, props)).toEqual(true);
  });
});

describe('cardSelector', () => {
  it('it should return my holecards for my position', () => {
    const mockedState = fromJS({
      account: {
        privKey: P1_KEY,
      },
      table: {
        [TBL_ADDR]: {
          data: {
            seats: [],
          },
          0: {
            state: 'flop',
            lineup: [{
              address: P1_ADDR,
            }, {
              address: P2_ADDR,
            }],
            holeCards: [15, 25],
          },
        },
      },
    });

    const props = {
      pos: 0,
      params: {
        tableAddr: TBL_ADDR,
        handId: 0,
      },
    };
    const cardSelector = makeCardsSelector();
    expect(cardSelector(mockedState, props)).toEqual([15, 25]);
  });

  it('it should return other guys cards if not my pos and he has cards', () => {
    const mockedState = fromJS({
      account: {
        privKey: P1_KEY,
      },
      table: {
        [TBL_ADDR]: {
          data: {
            seats: [],
          },
          0: {
            state: 'flop',
            lineup: [{
              address: P1_ADDR,
            }, {
              address: P2_ADDR,
              cards: [12, 21],
            }],
            holeCards: [15, 25],
          },
        },
      },
    });

    const props = {
      pos: 1,
      params: {
        tableAddr: TBL_ADDR,
        handId: 0,
      },
    };
    const cardSelector = makeCardsSelector();
    expect(cardSelector(mockedState, props)).toEqual([12, 21]);
  });

  it('it should not return cards if not my pos and no cards are in lineup', () => {
    const mockedState = fromJS({
      account: {
        privKey: P1_KEY,
      },
      table: {
        [TBL_ADDR]: {
          data: {
            seats: [],
          },
          0: {
            state: 'flop',
            lineup: [{
              address: P1_ADDR,
            }, {
              address: P2_ADDR,
            }],
            holeCards: [15, 25],
          },
        },
      },
    });

    const props = {
      pos: 1,
      params: {
        tableAddr: TBL_ADDR,
        handId: 0,
      },
    };
    const cardSelector = makeCardsSelector();
    expect(cardSelector(mockedState, props)).toEqual([-1, -1]);
  });
});
