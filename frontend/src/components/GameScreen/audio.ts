import { Howl } from 'howler';

export function createMusic(src: string, volume: number, enabled: boolean) {
  return new Howl({
    src: [src],
    loop: true,
    volume: enabled ? volume : 0,
    html5: true,
  });
}

export function createSfx(src: string, volume: number, enabled: boolean) {
  return new Howl({
    src: [src],
    volume: enabled ? volume : 0,
  });
}
