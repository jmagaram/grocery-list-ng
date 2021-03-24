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
      enter?: (s: S) => void;
      exit?: (s: S) => void;
      on: {
        [EK in E['event']]?: Transition<
          S & StateCore<SK>,
          E & EventCore<EK>,
          S
        >;
      };
    };
  };
}

type ProcessEvent<STATE, EVENT> = Transition<
  STATE,
  EVENT,
  { target: STATE; exitEffect?: () => void; enterEffect?: () => void }
>;

const processEvent = <
  S extends StateCore<SKEY>,
  E extends EventCore<EKEY>,
  SKEY extends string,
  EKEY extends string
>(
  machine: Machine<S, E, SKEY, EKEY>
) => {
  const result: ProcessEvent<S, E> = (source: S, event: E) => {
    const sourceNode = machine.states[source.state];
    if (sourceNode !== undefined) {
      const eventNode = sourceNode.on[event.event];
      if (eventNode !== undefined) {
        const target = eventNode(source, event);
        if (target !== undefined) {
          const targetNode = machine.states[target.state];
          let exitEffect: (() => void) | undefined;
          if (sourceNode.exit !== undefined) {
            const f = sourceNode.exit;
            exitEffect = () => f(source);
          }
          let enterEffect: (() => void) | undefined;
          if (targetNode?.enter !== undefined) {
            const f = targetNode.enter;
            enterEffect = () => f(target);
          }
          return {
            target,
            exitEffect,
            enterEffect,
          };
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
  private process: ProcessEvent<S, E>;

  constructor(private readonly machine: Machine<S, E, SKEY, EKEY>) {
    this.process = processEvent(machine);
    this.current = new BehaviorSubject<StateTransition<S, E>>({
      state: machine.initial,
    });
    this.machine.states[this.current.value.state.state]?.enter?.(
      this.current.value.state
    );
  }

  send(event: E) {
    const source = this.current.value.state;
    const result = this.process(source, event);
    if (result !== undefined) {
      result.exitEffect?.();
      this.current.next({
        state: result.target,
        previous: { state: source, event },
      });
      result.enterEffect?.();
    }
  }
}

export {};
