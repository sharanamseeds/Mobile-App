/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#f9f9f9';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f9f9f9',
    primary: "#19c394",
    secondary: "#f98258",
    subTitle: "gray",
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    boxColor: '#FFF',
    boxShadow: '#000'
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    primary: "#19c394",
    secondary: "#f98258",
    subTitle: "#F5F5F5",
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    boxColor: '#242424',
    boxShadow: 'grey'
  },
};
