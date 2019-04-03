
import { Howl } from 'howler'
import EpicSoundtrack from './EpicSoundtrack.mp3'
import SynthSoundtrack from './SynthSoundtrack.mp3'
import UpbeatSoundtrack from './UpbeatSoundtrack.mp3'

var songs = new Howl({
  src: ['./EpicSoundtrack.mp3', './SynthSoundtrack.mp3', './UpbeatSoundtrack.mp3'],
  loop: true,
  autoplay: true,
  onend: function() {
    console.log('Finished Playing.');
  }
});
songs.play();
// Credit Music: https://www.bensound.com
