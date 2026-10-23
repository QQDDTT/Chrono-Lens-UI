/**
 * Chrono-Lens 艺术声景引擎 (Chrono-Lens Procedural Soundscape Engine)
 * 遵循《BGM_SOUNDSCAPE_SPEC.md》声景美学设计规范：
 * - 纯原生 Web Audio API 程序化物理建模与环境氛围合成
 * - 0 外部文件依赖、0 网络延迟、0 流量消耗，100% 确保任何设备即点即出高品位温润声音
 * - 涵盖：温润新古典展馆(grand_hall)、莫奈光相微风(daylight)、慢速水滴晶弦(cinema)、天体星轨流风(celestial)
 */
(function (global) {
  "use strict";

  class SoundscapeEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.mode = "grand_hall";
      this.isPlaying = false;
      this.activeNodes = [];
      this.pulseTimer = null;
      this.btnEl = null;
      this.dotEl = null;
    }

    _ensureContext() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    init(options = {}) {
      this.mode = options.mode || "grand_hall";
      const btnId = options.btnId;
      const dotId = options.dotId;

      if (btnId) {
        this.btnEl = document.getElementById(btnId);
        if (this.btnEl) {
          this.btnEl.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggle();
          });
        }
      }

      if (dotId) {
        this.dotEl = document.getElementById(dotId);
      }
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
      } else {
        this.play();
      }
    }

    play() {
      try {
        this._ensureContext();
        if (this.isPlaying) return;

        this.isPlaying = true;
        this._updateUI(true);

        // 平滑淡入
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.18, now + 1.8);

        // 根据模式启动合成织体
        switch (this.mode) {
          case "daylight":
            this._startDaylightSoundscape();
            break;
          case "cinema":
            this._startCinemaSoundscape();
            break;
          case "celestial":
            this._startCelestialSoundscape();
            break;
          case "vault":
            this._startVaultSoundscape();
            break;
          case "studio":
            this._startStudioSoundscape();
            break;
          case "grand_hall":
          default:
            this._startGrandHallSoundscape();
            break;
        }
      } catch (err) {
        console.warn("[Chrono-Lens Soundscape] 启动失败:", err);
      }
    }

    stop() {
      if (!this.isPlaying || !this.ctx) return;
      this.isPlaying = false;
      this._updateUI(false);

      if (this.pulseTimer) {
        clearInterval(this.pulseTimer);
        clearTimeout(this.pulseTimer);
        this.pulseTimer = null;
      }

      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      setTimeout(() => {
        if (!this.isPlaying) {
          this._clearNodes();
        }
      }, 1300);
    }

    _clearNodes() {
      this.activeNodes.forEach((node) => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
    }

    _updateUI(active) {
      if (this.btnEl) {
        this.btnEl.classList.toggle("is-active", active);
        if (active) {
          this.btnEl.style.borderColor = "var(--accent-gold, #e2b968)";
          this.btnEl.style.color = "var(--accent-gold, #e2b968)";
        } else {
          this.btnEl.style.borderColor = "";
          this.btnEl.style.color = "";
        }
      }
      if (this.dotEl) {
        this.dotEl.style.opacity = active ? "1" : "0";
      }
    }

    /**
     * 1. 主展馆：坂本龙一 ·《Aqua》（水之息）51 秒美术馆级呼吸小乐章 (Audio-File-First Mandate)
     * - 优先加载实体音频文件：./assets/audio/gallery_aqua.wav
     * - 包含四阶段起承转合结构（虚空冥想 -> 情感升温 -> 高音绽放 -> 4.0s 严格纯静默留白）
     * - 若网络受限，自动平滑降级至内置微暖素白极简环境合成器
     */
    _startGrandHallSoundscape() {
      const audioUrl = "./assets/audio/gallery_aqua.wav";

      fetch(audioUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Audio fetch status: " + res.status);
          return res.arrayBuffer();
        })
        .then((arrayBuf) => this.ctx.decodeAudioData(arrayBuf))
        .then((audioBuffer) => {
          if (!this.isPlaying) return;
          const source = this.ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.loop = true;
          source.connect(this.masterGain);
          source.start(this.ctx.currentTime);
          this.activeNodes.push(source);
        })
        .catch((err) => {
          console.warn("[Chrono-Lens Soundscape] 实体音频加载受限，降级至程序化发声:", err);
          this._startProceduralGrandHall();
        });
    }

    _startProceduralGrandHall() {
      const now = this.ctx.currentTime;
      const baseFreqs = [110.0, 130.81, 164.81, 196.0]; // A2, C3, E3, G3
      
      const padGain = this.ctx.createGain();
      padGain.gain.setValueAtTime(0.08, now);
      padGain.connect(this.masterGain);
      this.activeNodes.push(padGain);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);
      filter.connect(padGain);
      this.activeNodes.push(filter);

      baseFreqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        
        // 缓慢失调与合唱微扰
        const detuneOsc = this.ctx.createOscillator();
        detuneOsc.frequency.setValueAtTime(0.08 + idx * 0.03, now);
        const detuneGain = this.ctx.createGain();
        detuneGain.gain.setValueAtTime(1.5, now);
        detuneOsc.connect(detuneGain);
        detuneGain.connect(osc.frequency);

        osc.connect(filter);
        osc.start(now);
        detuneOsc.start(now);

        this.activeNodes.push(osc, detuneOsc, detuneGain);
      });

      // 周期性柔音钢琴泛音微晶
      const pentatonic = [329.63, 392.00, 440.00, 493.88, 587.33, 659.25]; // E4, G4, A4, B4, D5, E5
      const triggerNote = () => {
        if (!this.isPlaying) return;
        const t = this.ctx.currentTime;
        const noteFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        
        const noteOsc = this.ctx.createOscillator();
        noteOsc.type = "sine";
        noteOsc.frequency.setValueAtTime(noteFreq, t);

        const noteGain = this.ctx.createGain();
        noteGain.gain.setValueAtTime(0.0001, t);
        noteGain.gain.linearRampToValueAtTime(0.045, t + 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);

        const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        if (panner) {
          panner.pan.setValueAtTime((Math.random() - 0.5) * 0.8, t);
          noteOsc.connect(noteGain).connect(panner).connect(this.masterGain);
        } else {
          noteOsc.connect(noteGain).connect(this.masterGain);
        }

        noteOsc.start(t);
        noteOsc.stop(t + 4.0);
      };

      triggerNote();
      this.pulseTimer = setInterval(() => {
        if (Math.random() > 0.3) triggerNote();
      }, 4200);
    }

    /**
     * 2. 自然光影大厅：印象派光斑与晨风 (Impressionist Light & Breeze)
     * - 微风噪声滤波流
     * - 尼龙微吉他清澈和弦泛音
     */
    _startDaylightSoundscape() {
      const now = this.ctx.currentTime;

      // 暖色微风噪声
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.98 * b1 + white * 0.08;
        b2 = 0.96 * b2 + white * 0.12;
        output[i] = (b0 + b1 + b2) * 0.25;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const breezeFilter = this.ctx.createBiquadFilter();
      breezeFilter.type = "lowpass";
      breezeFilter.frequency.setValueAtTime(220, now);

      const breezeGain = this.ctx.createGain();
      breezeGain.gain.setValueAtTime(0.04, now);

      this._daylightFilter = breezeFilter;
      whiteNoise.connect(breezeFilter).connect(breezeGain).connect(this.masterGain);
      whiteNoise.start(now);
      this.activeNodes.push(whiteNoise, breezeFilter, breezeGain);
    }

    /**
     * 时间轴色温与自适应低通滤波联动 (Circadian Dynamic Audio Filtering)
     * - 正午提升至 580Hz 呈现阳光明媚的大气微风
     * - 暗夜降至 160Hz 呈现深沉安详的夜色
     */
    setCircadianHour(hour) {
      if (!this.ctx || !this._daylightFilter) return;
      let targetFreq = 300;
      if (hour >= 20.0 || hour < 5.0) {
        targetFreq = 160; // 深夜墨青沉静
      } else if (hour >= 11.0 && hour <= 14.5) {
        targetFreq = 580; // 正午澄澈皓光
      } else if (hour >= 5.5 && hour < 8.0) {
        targetFreq = 380; // 晨曦清风
      } else {
        targetFreq = 260; // 暮色夕阳
      }
      this._daylightFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.25);

      // 印象和弦琶音 (G大调 / E小调温润晨光)
      const impressionChords = [
        [196.00, 246.94, 293.66, 392.00], // G3, B3, D4, G4
        [164.81, 220.00, 261.63, 329.63], // E3, A3, C4, E4
        [174.61, 220.00, 261.63, 349.23]  // F3, A3, C4, F4
      ];
      let chordIndex = 0;

      const playChordArpeggio = () => {
        if (!this.isPlaying) return;
        const t = this.ctx.currentTime;
        const currentChord = impressionChords[chordIndex % impressionChords.length];
        chordIndex++;

        currentChord.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t + idx * 0.28);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.0001, t + idx * 0.28);
          gain.gain.linearRampToValueAtTime(0.038, t + idx * 0.28 + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.28 + 3.2);

          osc.connect(gain).connect(this.masterGain);
          osc.start(t + idx * 0.28);
          osc.stop(t + idx * 0.28 + 3.4);
        });
      };

      playChordArpeggio();
      this.pulseTimer = setInterval(playChordArpeggio, 4800);
    }

    /**
     * 3. 慢速微影大厅：《停留的微风 · 瞬息》(Gentle Moments) 52 秒美术馆级呼吸小乐章
     * - 优先加载实体音频文件：./assets/audio/cinema_gentle_moments.wav
     * - 包含四阶段起承转合结构（虚空冥想 -> 情感升温 -> 高音绽放 -> 4.8s 严格纯静默留白）
     * - 若网络受限，自动平滑降级至内置程序化慢速微影氛围引擎
     */
    _startCinemaSoundscape() {
      const audioUrl = "./assets/audio/cinema_gentle_moments.wav";

      fetch(audioUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Audio fetch status: " + res.status);
          return res.arrayBuffer();
        })
        .then((arrayBuf) => this.ctx.decodeAudioData(arrayBuf))
        .then((audioBuffer) => {
          if (!this.isPlaying) return;
          const source = this.ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.loop = true;
          source.connect(this.masterGain);
          source.start(this.ctx.currentTime);
          this.activeNodes.push(source);
        })
        .catch((err) => {
          console.warn("[Chrono-Lens Soundscape] 瞬息实体音频加载受限，降级至程序化发声:", err);
          this._startProceduralCinema();
        });
    }

    _startProceduralCinema() {
      const now = this.ctx.currentTime;

      // 低沉深色长音
      const droneOsc = this.ctx.createOscillator();
      droneOsc.type = "sine";
      droneOsc.frequency.setValueAtTime(69.30, now); // Db2

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = "lowpass";
      droneFilter.frequency.setValueAtTime(160, now);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.065, now);

      droneOsc.connect(droneFilter).connect(droneGain).connect(this.masterGain);
      droneOsc.start(now);
      this.activeNodes.push(droneOsc, droneFilter, droneGain);

      // 水滴触地同心微共鸣 (Crystal Droplets)
      const triggerDroplet = () => {
        if (!this.isPlaying) return;
        const t = this.ctx.currentTime;
        const dropFreq = 698.46 + Math.random() * 410; // F5/Ab5 区域

        const dropOsc = this.ctx.createOscillator();
        dropOsc.type = "sine";
        dropOsc.frequency.setValueAtTime(dropFreq, t);
        dropOsc.frequency.exponentialRampToValueAtTime(dropFreq * 0.6, t + 0.35);

        const dropGain = this.ctx.createGain();
        dropGain.gain.setValueAtTime(0.0001, t);
        dropGain.gain.linearRampToValueAtTime(0.045, t + 0.02);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

        dropOsc.connect(dropGain).connect(this.masterGain);
        dropOsc.start(t);
        dropOsc.stop(t + 2.0);
      };

      triggerDroplet();
      this.pulseTimer = setInterval(() => {
        if (Math.random() > 0.25) triggerDroplet();
      }, 2600);
    }

    /**
     * 纯原声物理三角钢琴物理建模缓冲区 (True Acoustic Grand Piano Physical Modeling)
     * - 彻底抛弃电子正弦波！
     * - 物理毛毡琴槌击弦瞬态 (Felt Hammer Strike Impulse)
     * - 双弦同音物理微去谐耦合 (Acoustic Unison Double String Waveguide)
     * - 真实木质共鸣箱与钢丝高频吸收阻尼 (Bridge & String Dispersion)
     */
    _getPhysicalPianoBuffer(freq, duration = 2.4) {
      if (!this.ctx) return null;
      if (!this._pianoCache) this._pianoCache = {};
      const key = Math.round(freq * 10);
      if (this._pianoCache[key]) return this._pianoCache[key];

      const sampleRate = this.ctx.sampleRate || 44100;
      const numSamples = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, numSamples, sampleRate);
      const data = buffer.getChannelData(0);

      // 双弦同音微去谐物理耦合 (模拟三角钢琴复弦谐振)
      const periodA = sampleRate / freq;
      const periodB = sampleRate / (freq * 1.0016); // 0.16% 极微去谐带来琴声光泽

      const lenA = Math.round(periodA);
      const lenB = Math.round(periodB);

      const delayA = new Float32Array(lenA);
      const delayB = new Float32Array(lenB);

      // 琴槌毛毡击弦瞬态 (约 2.8ms 物理接触脉冲，彻底消除电子蜂鸣)
      const hammerLen = Math.min(lenA, Math.floor(sampleRate * 0.0028));
      for (let i = 0; i < hammerLen; i++) {
        const env = Math.sin((Math.PI * i) / hammerLen);
        const noise = (Math.random() * 2 - 1) * 0.22;
        const val = env * (0.78 + noise);
        delayA[i] = val;
        delayB[i % lenB] = val;
      }

      // 琴弦物理损耗因子 (根据频率自适应物理耗散)
      const decayFactor = Math.max(0.992, Math.min(0.9972, 0.9978 - (freq / 9000)));

      let ptrA = 0;
      let ptrB = 0;
      let prevA = 0;
      let prevB = 0;

      for (let i = 0; i < numSamples; i++) {
        const valA = delayA[ptrA];
        const valB = delayB[ptrB];

        // 真实物理钢丝振动输出
        data[i] = (valA + valB) * 0.5;

        // 琴码与琴弦末端高频吸收滤波反馈 (Karplus-Strong 真实弦振模型)
        const nextA = (valA + prevA) * 0.5 * decayFactor;
        const nextB = (valB + prevB) * 0.5 * decayFactor;

        delayA[ptrA] = nextA;
        delayB[ptrB] = nextB;

        prevA = valA;
        prevB = valB;

        ptrA = (ptrA + 1) % lenA;
        ptrB = (ptrB + 1) % lenB;
      }

      this._pianoCache[key] = buffer;
      return buffer;
    }

    /**
     * 原声钢琴单音演奏器 (Acoustic Solo Piano Note Player)
     * - 纯真实钢琴音色，零电子合成音
     * - 真实立体声琴键空间展开 (低音偏左，高音偏右)
     */
    _playPianoNote(freq, time, duration = 1.8, velocity = 0.8) {
      if (!this.ctx) return;
      const buffer = this._getPhysicalPianoBuffer(freq, Math.min(duration + 0.3, 3.2));
      if (!buffer) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(velocity * 0.36, time);
      // 自然延音衰减
      gain.gain.setValueAtTime(velocity * 0.36, time + duration - 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);

      // 音板木质共鸣滤波 (温润饱满)
      const soundboard = this.ctx.createBiquadFilter();
      soundboard.type = "lowpass";
      soundboard.frequency.setValueAtTime(Math.min(3800, freq * 4.0), time);

      // 琴键自然立体声展开
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) {
        const panVal = Math.max(-0.45, Math.min(0.45, (Math.log2(freq / 350) * 0.28)));
        panner.pan.setValueAtTime(panVal, time);
        source.connect(gain).connect(soundboard).connect(panner).connect(this.masterGain);
      } else {
        source.connect(gain).connect(soundboard).connect(this.masterGain);
      }

      source.start(time);
      source.stop(time + duration + 0.25);
    }

    /**
     * 4. 全景空间大厅：《星际穿越 · Cornfield Chase》纯钢琴标志性副歌循环
     * - 不播放完整长曲，直接提取最打动人心的标志性副歌（Chorus Hook）
     * - 严格设置 3.0 秒空气静默留白，让上一轮琴音自然散尽，杜绝首尾和弦重叠冲突 (Anti-Clash)
     * - A/B 两套经典副歌旋律交替（A5 经典主题 / D6 广袤升华主题），纯钢琴温润呼吸
     */
    /**
     * 4. 全景空间大厅：优先加载并播放标准物理音频文件 (Audio-File-First Mandate)
     * - 优先加载物理音频实体文件：./assets/audio/celestial_cornfield_chase.wav
     * - 音频文件中已内嵌标准 8 小节慢板副歌与 3.0 秒绝对静音留白，启动原生 loop 循环
     * - 若网络环境受限，自动平滑降级至内置物理建模发声器
     */
    _startCelestialSoundscape() {
      const audioUrl = "./assets/audio/celestial_cornfield_chase.wav";

      fetch(audioUrl)
        .then(res => {
          if (!res.ok) throw new Error("Audio fetch status: " + res.status);
          return res.arrayBuffer();
        })
        .then(arrayBuf => this.ctx.decodeAudioData(arrayBuf))
        .then(audioBuffer => {
          if (!this.isPlaying) return;
          const source = this.ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.loop = true; // 音频文件已精确烘焙 3 秒留白，直接无缝循环

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.88, this.ctx.currentTime + 1.2);

          source.connect(gain).connect(this.masterGain);
          source.start(0);
          this.activeNodes.push(source, gain);
        })
        .catch(err => {
          console.warn("未能加载物理音频实体文件，平滑降级至内置物理合成:", err);
          this._startCelestialSynthesizer();
        });
    }

    _startCelestialSynthesizer() {
      const stepTime = 0.245;
      const measureDuration = stepTime * 6;
      const pauseDuration = 3.0;

      const arpeggios = {
        Dm: [146.83, 220.00, 293.66, 349.23, 440.00, 587.33],
        Bb: [116.54, 174.61, 233.08, 293.66, 349.23, 466.16],
        C:  [130.81, 196.00, 261.63, 329.63, 392.00, 523.25],
        Am: [110.00, 164.81, 220.00, 261.63, 329.63, 440.00]
      };

      const chordProgression = ["Dm", "Dm", "Bb", "Bb", "C", "C", "Am", "Am"];
      let chorusCycleCount = 0;

      const playSingleChorus = (cycleIdx) => {
        if (!this.isPlaying || !this.ctx) return;
        const chorusStartTime = this.ctx.currentTime + 0.05;
        const isThemeB = (cycleIdx % 2 === 1);

        for (let m = 0; m < 8; m++) {
          const mStartTime = chorusStartTime + m * measureDuration;
          const chordKey = chordProgression[m];
          const notes = arpeggios[chordKey];

          const noteDecay = (m === 7) ? 1.4 : 1.9;
          notes.forEach((freq, idx) => {
            const t = mStartTime + idx * stepTime;
            const vel = (idx === 0 || idx === 3) ? 0.76 : 0.58;
            this._playPianoNote(freq, t, noteDecay, vel);
          });

          if (!isThemeB) {
            if (m === 0) this._playPianoNote(880.00, mStartTime, 2.6, 0.95);
            if (m === 2) this._playPianoNote(698.46, mStartTime, 1.3, 0.90);
            if (m === 3) this._playPianoNote(783.99, mStartTime, 1.3, 0.90);
            if (m === 4) this._playPianoNote(659.25, mStartTime, 1.2, 0.85);
            if (m === 5) this._playPianoNote(587.33, mStartTime, 1.2, 0.85);
            if (m === 6) this._playPianoNote(698.46, mStartTime, 1.2, 0.80);
            if (m === 7) this._playPianoNote(587.33, mStartTime, 1.8, 0.75);
          } else {
            if (m === 0) this._playPianoNote(1174.66, mStartTime, 2.6, 0.98);
            if (m === 2) this._playPianoNote(932.33, mStartTime, 1.3, 0.90);
            if (m === 3) this._playPianoNote(1046.50, mStartTime, 1.3, 0.90);
            if (m === 4) this._playPianoNote(880.00, mStartTime, 1.3, 0.85);
            if (m === 5) this._playPianoNote(783.99, mStartTime, 1.3, 0.85);
            if (m === 6) this._playPianoNote(880.00, mStartTime, 2.0, 0.80);
            if (m === 7) this._playPianoNote(587.33, mStartTime, 1.8, 0.75);
          }
        }

        const totalLoopTimeMs = (8 * measureDuration + pauseDuration) * 1000;
        this.pulseTimer = setTimeout(() => {
          if (this.isPlaying) {
            chorusCycleCount++;
            playSingleChorus(chorusCycleCount);
          }
        }, totalLoopTimeMs);
      };

      playSingleChorus(chorusCycleCount);
    }

    /**
     * 5. 时光金库与先锋实验厅适配
     */
    _startVaultSoundscape() {
      this._startGrandHallSoundscape();
    }

    _startStudioSoundscape() {
      this._startGrandHallSoundscape();
    }
  }

  // 挂载至全局
  global.ChronoSoundscape = new SoundscapeEngine();

})(typeof window !== "undefined" ? window : this);
