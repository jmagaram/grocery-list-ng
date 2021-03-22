import { Machine, Interpreter } from './machine';

describe('simple state machine', () => {
  type States = { state: 'dormant' } | { state: 'counting'; value: number };

  type Events =
    | { event: 'start'; initialValue: number }
    | { event: 'increment' }
    | { event: 'multiplyBy'; operand: number };

  const counter: Machine<States, Events> = {
    initial: { state: 'dormant' },
    states: {
      dormant: {
        start: (s, e) => ({ state: 'counting', value: e.initialValue }),
      },
      counting: {
        increment: (s, e) => ({ state: 'counting', value: s.value + 1 }),
        multiplyBy: (s, e) => ({
          state: 'counting',
          value: s.value * e.operand,
        }),
      },
    },
  };

  it('initial state equals initial state of machine', () => {
    const i = new Interpreter(counter);
    expect(i.current.value).toEqual({ state: { state: 'dormant' } });
  });

  it('send - when event is not expected do nothing', () => {
    const i = new Interpreter(counter);
    const before = i.current.value;
    i.send({ event: 'increment' });
    const after = i.current.value;
    expect(before).toEqual(after);
  });

  it('send - transition to new state', () => {
    const i = new Interpreter(counter);
    const s1: States = i.current.value.state;
    const e1: Events = { event: 'start', initialValue: 5 };
    const s2: States = { state: 'counting', value: 5 };
    const e2: Events = { event: 'increment' };
    const s3: States = { state: 'counting', value: 6 };
    const e3: Events = { event: 'multiplyBy', operand: 3 };
    const s4: States = { state: 'counting', value: 18 };
    i.send(e1);
    expect(i.current.value).toEqual({
      state: s2,
      previous: {
        state: s1,
        event: e1,
      },
    });
    i.send(e2);
    expect(i.current.value).toEqual({
      state: s3,
      previous: {
        state: s2,
        event: e2,
      },
    });
    i.send(e3);
    expect(i.current.value).toEqual({
      state: s4,
      previous: {
        state: s3,
        event: e3,
      },
    });
  });
});
