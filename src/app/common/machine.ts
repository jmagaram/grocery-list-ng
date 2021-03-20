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

export type StateChange<STATE, EVENT> = {
  state: STATE;
  previous?: {
    state: STATE;
    event: EVENT;
  };
};

export class Interpreter<
  S extends StateCore<SKEY>,
  E extends EventCore<EKEY>,
  SKEY extends string,
  EKEY extends string
> {
  state: BehaviorSubject<StateChange<S, E>>;

  constructor(readonly machine: Machine<S, E, SKEY, EKEY>) {
    this.state = new BehaviorSubject<StateChange<S, E>>({
      state: machine.initial,
    });
  }

  send(event: E) {
    const source = this.state.value.state;
    const stateNode = this.machine.states[source.state];
    if (stateNode !== undefined) {
      const eventNode = stateNode[event.event];
      if (eventNode !== undefined) {
        const target = eventNode(source, event);
        if (target !== undefined) {
          this.state.next({
            state: target,
            previous: { state: source, event },
          });
        }
      }
    }
  }
}
