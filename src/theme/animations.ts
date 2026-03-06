import { Easing } from 'react-native-reanimated';

export const motion = {
  duration: {
    fast: 200,
    normal: 250,
    slow: 300,
    modal: 350,
    chart: 800,
  },
  stagger: {
    cards: 80,
    weekCells: 40,
    gridRows: 50,
    progressRows: 100,
  },
  easing: {
    out: Easing.out(Easing.ease),
    in: Easing.in(Easing.ease),
    linear: Easing.linear,
  },
};
