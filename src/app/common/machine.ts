import { BehaviorSubject } from 'rxjs';

export interface StateCore<SKEY> {
  state: SKEY; // discriminator kind/type
}

export interface EventCore<EKEY> {
  event: EKEY; // discriminator kind/type
}

export type Transition<SOURCE, EVENT, TARGET> = (
  s: SOURCE,
  e: EVENT
) => TARGET | undefined;

export interface Machine<
  S extends StateCore<SKEY>,
  E extends EventCore<EKEY>,
  SKEY extends string = S['state'],
  EKEY extends string = E['event']
> {
  initial: S;
  states: {
    [SK in S['state']]?: {
      [EK in E['event']]?: Transition<S & StateCore<SK>, E & EventCore<EK>, S>;
    };
  };
}

const transition = <
  S extends StateCore<SKEY>,
  E extends EventCore<EKEY>,
  SKEY extends string,
  EKEY extends string
>(
  machine: Machine<S, E, SKEY, EKEY>
): Transition<S, E, S> => {
  const result = (s: S, e: E) => {
    const source = s;
    const stateNode = machine.states[source.state];
    if (stateNode !== undefined) {
      const eventNode = stateNode[e.event];
      if (eventNode !== undefined) {
        const target = eventNode(source, e);
        if (target !== undefined) {
          return target;
        }
      }
    }
    return undefined;
  };
  return result;
};

export type StateTransition<S, E> = {
  state: S;
  previous?: {
    state: S;
    event: E;
  };
};

export class Interpreter<
  S extends StateCore<SKEY>,
  E extends EventCore<EKEY>,
  SKEY extends string,
  EKEY extends string
> {
  current: BehaviorSubject<StateTransition<S, E>>;

  private transition: Transition<S, E, S>;

  constructor(private readonly machine: Machine<S, E, SKEY, EKEY>) {
    this.transition = transition(machine);
    this.current = new BehaviorSubject<StateTransition<S, E>>({
      state: machine.initial,
    });
  }

  send(event: E) {
    const source = this.current.value.state;
    const target = this.transition(source, event);
    if (target !== undefined) {
      this.current.next({ state: target, previous: { state: source, event } });
    }
  }
}

export {};
