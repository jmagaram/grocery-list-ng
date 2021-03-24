import { Machine, Interpreter } from './machine';

describe('simple state machine', () => {
  type States = { state: 'dormant' } | { state: 'counting'; value: number };

  type Events =
    | { event: 'start'; initialValue: number }
    | { event: 'increment' }
    | { event: 'multiplyBy'; operand: number }
    | { event: 'stop' };

  let dormantExit: States | undefined;
  let dormantEnter: States | undefined;
  let countExit: States | undefined;
  let countEnter: States | undefined;

  const clearEffects = () => {
    dormantExit = undefined;
    dormantEnter = undefined;
    countExit = undefined;
    countEnter = undefined;
  };

  const counter: Machine<States, Events> = {
    initial: { state: 'dormant' },
    states: {
      dormant: {
        on: {
          start: (s, e) => ({ state: 'counting', value: e.initialValue }),
        },
        exit: (s) => {
          dormantExit = s;
        },
        enter: (s) => {
          dormantEnter = s;
        },
      },
      counting: {
        on: {
          increment: (s, e) => ({ state: 'counting', value: s.value + 1 }),
          multiplyBy: (s, e) => ({
            state: 'counting',
            value: s.value * e.operand,
          }),
          stop: (s, e) => ({ state: 'dormant' }),
        },
        enter: (s) => {
          countEnter = s;
        },
        exit: (s) => {
          countExit = s;
        },
      },
    },
  };

  it('initial state equals initial state of machine', () => {
    const i = new Interpreter(counter);
    expect(i.current.value).toEqual({ state: { state: 'dormant' } });
  });

  it('enter effect invoked for initial state', () => {
    clearEffects();
    const i = new Interpreter(counter);
    expect(dormantEnter).toEqual(i.current.value.state);
    expect(dormantExit).toBeUndefined();
    expect(countEnter).toBeUndefined();
    expect(countExit).toBeUndefined();
  });

  it('enter and exit effects invoked when transition', () => {
    const i = new Interpreter(counter);
    let s: States | undefined;

    clearEffects();
    s = i.current.value.state;
    i.send({ event: 'start', initialValue: 4 });
    expect(dormantExit).toEqual(s);
    expect(countEnter).toEqual(i.current.value.state);
    expect(dormantEnter).toBeUndefined();
    expect(countExit).toBeUndefined();

    clearEffects();
    s = i.current.value.state;
    i.send({ event: 'stop' });
    expect(countExit).toEqual(s);
    expect(dormantEnter).toEqual(i.current.value.state);
    expect(countEnter).toBeUndefined();
    expect(dormantExit).toBeUndefined();
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
