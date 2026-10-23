# site 目录

## 1. 职责说明
负责存放 site 相关的工程与规范资产。

遵循工程根目录全景规范：[README.md](../README.md)

## 子目录说明 : data/audio

#### Chrono-Lens 策展声景与背景音频库 (Soundscape Repository)

本目录为 Chrono-Lens 全场景提供免版权（CC0 / CC BY）、高保真环境声景与背景音乐。

##### 空间声景音频清单

| 空间 / 模块 | 音频文件 | 画面对齐风格 | 声学流派 | 格式与规格 |
| :--- | :--- | :--- | :--- | :--- |
| **主展馆选廊** | `bgm_grand_hall_alabaster.mp3` | 美术馆微暖素白、大留白当代画廊 | 温润极简新古典（柔音毡呢钢琴与极微弦乐） | 48kHz / 192kbps / -20 LUFS |
| **模块 01 ·「穹·极」** | `bgm_module01_panoramic_sky.mp3` | 360° 天球、景泰蓝天球仪、透纳流云 | 空灵天体氛围 + 双耳高山真实风声采样 | 48kHz / 192kbps (Binaural 3D) |
| **模块 02 ·「晨·昏」** | `bgm_module02_daylight_monet.mp3` | 莫奈日出印象派光斑、35° 斜射光柱 | 印象派微室内乐（尼龙微吉他与竖琴晨露琶音） | 48kHz / 192kbps / Display P3 适配 |
| **模块 03 ·「瞬·息」** | `bgm_module03_cinema_droplets.mp3` | 2.39:1 宽银幕暗室、夜光珐琅水波 | 慢速微影诗意配乐 + 120fps 水滴微晶与双耳微雨 | 48kHz / 192kbps (Seamless Loop) |
| **模块 04 ·「重·温」** | `bgm_module04_vault_memories.mp3` | 黑曜金库暗调、暗房红光、掐丝时光锁印 | 复古黑胶与时光记忆（哑音立式钢琴与唱针暖底噪） | 48kHz / 192kbps Tape Saturation |
| **模块 05 ·「重·构」** | `bgm_module05_studio_spectral.mp3` | 高温裂变冰裂纹珐琅、波普几何光谱 | 先锋极简微故障（正弦波脉冲与冰裂物理摩擦微响） | 48kHz / 192kbps Glitch Tone |

##### 播放技术特性
- **等功率交叉淡入淡出**：空间切换时 2.5s 柔和过渡；
- **微距探针低通滤波**：调焦与滑动时自动挂载 450Hz Low-pass 景深滤波。

## 目录结构

```text
site/
├── assets/
│   ├── artworks/
│   ├── audio/
│   ├── css/
│   ├── icons/
│   ├── images/
│   ├── js/
│   └── soundscape.js
├── data/
│   ├── audio/
│   ├── media/
│   └── catalog.json
├── cinema.html
├── CNAME
├── daylight.html
├── daylight-salon.html
├── favicon.svg
├── index.html
├── manifest.json
├── panorama.html
├── service-worker.js
├── studio.html
└── vault.html
```
