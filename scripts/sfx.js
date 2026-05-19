(function () {
  'use strict';

  let ac = null;
  let bgMusic = null;

  function go() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
  }

  function noiseBuf(sec) {
    const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  function play(fn) {
    try {
      go();
      fn();
    } catch (e) {}
  }

  function tone(hz, at, dur, level, type = 'sine', out = ac.destination, cutoff = null) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(hz, at);
    gain.gain.setValueAtTime(0.001, at);
    gain.gain.linearRampToValueAtTime(level, at + Math.min(0.018, dur * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
    if (cutoff) {
      const filt = ac.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = cutoff;
      osc.connect(filt);
      filt.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(out);
    osc.start(at);
    osc.stop(at + dur + 0.04);
  }

  function startBgMusic() {
    play(() => {
      if (bgMusic) return;
      const t = ac.currentTime;

      // I keep the loop relaxed, warm, and quietly propulsive.
      const bpm = 86;
      const beat = 60 / bpm;
      const bar = beat * 4;

      const master = ac.createGain();
      master.gain.setValueAtTime(0.001, t);
      master.gain.linearRampToValueAtTime(0.2, t + 1.2);
      master.connect(ac.destination);

      const dly = ac.createDelay(0.8);
      dly.delayTime.value = beat * 0.72;
      const dlyFeedback = ac.createGain();
      dlyFeedback.gain.value = 0.18;
      const dlyLp = ac.createBiquadFilter();
      dlyLp.type = 'lowpass';
      dlyLp.frequency.value = 1250;
      const dlyGn = ac.createGain();
      dlyGn.gain.value = 0.16;
      master.connect(dly);
      dly.connect(dlyLp);
      dlyLp.connect(dlyFeedback);
      dlyFeedback.connect(dly);
      dlyLp.connect(dlyGn);
      dlyGn.connect(ac.destination);

      const air = ac.createBufferSource();
      air.buffer = noiseBuf(4.0);
      air.loop = true;
      const airFilt = ac.createBiquadFilter();
      airFilt.type = 'bandpass';
      airFilt.frequency.value = 2400;
      airFilt.Q.value = 0.5;
      const airGain = ac.createGain();
      airGain.gain.value = 0.002;
      air.connect(airFilt);
      airFilt.connect(airGain);
      airGain.connect(master);
      air.start(t);

      function envGain(at, attack, decay, level, out = master) {
        const gain = ac.createGain();
        gain.gain.setValueAtTime(0.001, at);
        gain.gain.linearRampToValueAtTime(level, at + attack);
        gain.gain.exponentialRampToValueAtTime(0.001, at + decay);
        gain.connect(out);
        return gain;
      }

      function kick(at) {
        const osc = ac.createOscillator();
        const gain = envGain(at, 0.006, 0.46, 0.34);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(112, at);
        osc.frequency.exponentialRampToValueAtTime(48, at + 0.22);
        osc.connect(gain);
        osc.start(at);
        osc.stop(at + 0.5);
      }

      function snare(at, level = 0.09) {
        const ns = ac.createBufferSource();
        ns.buffer = noiseBuf(0.18);
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1450;
        bp.Q.value = 0.8;
        const gain = envGain(at, 0.004, 0.16, level);
        ns.connect(bp);
        bp.connect(gain);
        ns.start(at);
        ns.stop(at + 0.2);
      }

      function hat(at, level = 0.026) {
        const ns = ac.createBufferSource();
        ns.buffer = noiseBuf(0.045);
        const hp = ac.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 5200;
        const gain = envGain(at, 0.002, 0.04, level);
        ns.connect(hp);
        hp.connect(gain);
        ns.start(at);
        ns.stop(at + 0.055);
      }

      function bass(hz, at, dur, level = 0.105) {
        const osc = ac.createOscillator();
        const filt = ac.createBiquadFilter();
        const gain = envGain(at, 0.012, dur, level);
        osc.type = 'triangle';
        osc.frequency.value = hz;
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(240, at);
        filt.frequency.exponentialRampToValueAtTime(88, at + dur);
        osc.connect(filt);
        filt.connect(gain);
        osc.start(at);
        osc.stop(at + dur + 0.05);
      }

      function velvetKey(hz, at, dur, level) {
        [1, 2, 3].forEach((mul, i) => {
          const osc = ac.createOscillator();
          const gain = envGain(at, 0.018 + i * 0.004, dur * (i ? 0.66 : 1), level * (i === 0 ? 1 : i === 1 ? 0.16 : 0.055));
          osc.type = i === 0 ? 'sine' : 'triangle';
          osc.frequency.value = hz * mul;
          osc.connect(gain);
          osc.start(at);
          osc.stop(at + dur + 0.04);
        });
      }

      const chords = [
        [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
        [174.61, 220.00, 261.63, 329.63, 440.00], // Fmaj7/9
        [196.00, 246.94, 293.66, 369.99, 493.88], // Gmaj9 color
        [164.81, 220.00, 246.94, 329.63, 392.00]  // Em7/11
      ];

      function chord(notes, at, dur, level = 0.032) {
        notes.forEach((hz, i) => velvetKey(hz, at + i * 0.012, dur, level * (i < 2 ? 0.82 : 1)));
      }

      const timers = [];
      let barIdx = 0;

      const schedule = () => {
        const bs = ac.currentTime + 0.08;
        for (let i = 0; i < 4; i++) {
          const barStart = bs + i * bar;
          const chordNotes = chords[(barIdx + i) % chords.length];
          kick(barStart);
          kick(barStart + beat * 2.72);
          snare(barStart + beat * 2, i % 2 ? 0.105 : 0.086);
          [0.5, 1, 1.5, 2.5, 3, 3.5].forEach((off, hi) => hat(barStart + beat * off, hi % 2 ? 0.02 : 0.028));
          chord(chordNotes, barStart + beat * 0.08, beat * 1.65, 0.027);
          chord(chordNotes.slice(1), barStart + beat * 2.16, beat * 1.45, 0.023);
          const root = chordNotes[0] / 2;
          bass(root, barStart + beat * 0.02, beat * 0.72, 0.12);
          bass(root * 1.5, barStart + beat * 1.48, beat * 0.58, 0.076);
          bass(root * 1.25, barStart + beat * 2.54, beat * 0.64, 0.086);
          if (i % 2 === 1) velvetKey(chordNotes[4] * 2, barStart + beat * 3.18, beat * 0.48, 0.018);
        }
        barIdx += 4;
      };

      schedule();
      timers.push(setInterval(schedule, bar * 4 * 1000));
      bgMusic = { master, air, timers, dly };
    });
  }

  window.SFX = {
    init: go,
    bg: startBgMusic,
    shuffle() {
      play(() => {
        const t = ac.currentTime;
        const master = ac.createGain();
        master.gain.setValueAtTime(1.55, t);
        master.gain.exponentialRampToValueAtTime(0.001, t + 1.08);
        master.connect(ac.destination);

        function paper(at, dur, level, freq, pan = 0) {
          const ns = ac.createBufferSource();
          ns.buffer = noiseBuf(dur);
          const bp = ac.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = freq;
          bp.Q.value = 1.8;
          const hp = ac.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.value = 760;
          const gn = ac.createGain();
          gn.gain.setValueAtTime(0.001, at);
          gn.gain.linearRampToValueAtTime(level, at + 0.012);
          gn.gain.exponentialRampToValueAtTime(0.001, at + dur);

          let out = gn;
          if (ac.createStereoPanner) {
            const pn = ac.createStereoPanner();
            pn.pan.setValueAtTime(pan, at);
            gn.connect(pn);
            out = pn;
          }

          ns.connect(bp);
          bp.connect(hp);
          hp.connect(gn);
          out.connect(master);
          ns.start(at);
          ns.stop(at + dur + 0.02);
        }

        [0, 0.07, 0.14, 0.23, 0.32, 0.44, 0.56, 0.69].forEach((offset, i) => {
          paper(
            t + offset,
            0.055 + Math.random() * 0.025,
            0.065 + i * 0.006,
            1450 + Math.random() * 1700,
            i % 2 === 0 ? -0.22 : 0.22
          );
        });

        tone(118, t + 0.62, 0.11, 0.095, 'triangle', master, 420);
        tone(72, t + 0.86, 0.18, 0.12, 'sine', master, 220);
      });
    },
    flip() {
      play(() => {
        const t = ac.currentTime;
        const ns = ac.createBufferSource();
        ns.buffer = noiseBuf(0.12);
        const bf = ac.createBiquadFilter();
        bf.type = 'bandpass';
        bf.frequency.value = 2400;
        const gn = ac.createGain();
        gn.gain.setValueAtTime(0.25, t);
        gn.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        ns.connect(bf);
        bf.connect(gn);
        gn.connect(ac.destination);
        ns.start(t);
        tone(720, t, 0.12, 0.06, 'sine');
      });
    },
    land() {
      play(() => tone(82, ac.currentTime, 0.11, 0.22, 'sine'));
    },
    click() {
      play(() => tone(920, ac.currentTime, 0.045, 0.08, 'sine'));
    },
    tab() {
      play(() => {
        const t = ac.currentTime;
        tone(360, t, 0.055, 0.055, 'triangle');
        tone(540, t + 0.035, 0.075, 0.04, 'sine');
      });
    },
    swipe(dir) {
      play(() => {
        const t = ac.currentTime;
        if (dir === 'yes') {
          tone(520, t, 0.10, 0.06, 'triangle');
          tone(780, t + 0.052, 0.15, 0.065, 'triangle');
          tone(1040, t + 0.096, 0.17, 0.045, 'sine');
          return;
        }
        tone(240, t, 0.18, 0.055, 'triangle');
        tone(150, t + 0.08, 0.22, 0.04, 'sawtooth', ac.destination, 700);
      });
    },
    fire() {
      play(() => {
        const t = ac.currentTime;
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            try {
              const now = ac.currentTime;
              const ns = ac.createBufferSource();
              ns.buffer = noiseBuf(0.055);
              const f = ac.createBiquadFilter();
              f.type = 'highpass';
              f.frequency.value = 900 + Math.random() * 4600;
              const g = ac.createGain();
              g.gain.setValueAtTime(0.11 + Math.random() * 0.13, now);
              g.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
              ns.connect(f);
              f.connect(g);
              g.connect(ac.destination);
              ns.start(now);
            } catch (e) {}
          }, i * 55 + Math.random() * 25);
        }
        tone(54, t, 0.5, 0.11, 'sawtooth', ac.destination, 180);
      });
    },
    chime() {
      play(() => {
        [523, 659, 784, 988].forEach((hz, i) => {
          setTimeout(() => {
            try { tone(hz, ac.currentTime, 0.22, 0.08, 'triangle'); } catch (e) {}
          }, i * 72);
        });
      });
    }
  };
})();
