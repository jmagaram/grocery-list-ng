import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

// https://angular.io/guide/transition-and-triggers#enter-and-leave-aliases
// https://fireship.io/lessons/angular-router-animations/

const enterTimings = '500ms ease-out';
const leaveTimings = '500ms ease-in';
const offPageLeft = 'translateX(-75%)';
const offPageRight = 'translateX(75%)';
const centerPage = 'translateX(0px)';

export const leftPanel = [
  transition(':enter', [
    style({
      opacity: 0.0,
      position: 'absolute',
      width: '100%',
      transform: offPageLeft,
    }),
    animate(enterTimings, style({ opacity: 1, transform: centerPage })),
  ]),
  transition(':leave', [
    style({
      opacity: 1.0,
      position: 'absolute',
      width: '100%',
      transform: centerPage,
    }),
    animate(leaveTimings, style({ opacity: 0.0, transform: offPageLeft })),
  ]),
];

export const rightPanel = [
  transition(':enter', [
    style({
      opacity: 0.0,
      position: 'absolute',
      width: '100%',
      transform: offPageRight,
    }),
    animate(enterTimings, style({ opacity: 1, transform: centerPage })),
  ]),
  transition(':leave', [
    style({
      opacity: 1.0,
      position: 'absolute',
      width: '100%',
      transform: centerPage,
    }),
    animate(leaveTimings, style({ opacity: 0.0, transform: offPageRight })),
  ]),
];
