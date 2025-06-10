import { Howl } from 'howler';
import clickSrc from '../assets/sounds/click.mp3';

let clickHowl: Howl | null = null;

export function playClick(volume: number = 1) {
  if (!clickHowl) {
    clickHowl = new Howl({ src: [clickSrc], volume });
  }
  clickHowl.volume(volume);
  clickHowl.play();
}
