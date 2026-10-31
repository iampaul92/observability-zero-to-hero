// The Tea Merchant's Road: one timeline for picture, subtitles, score and mix.
export const DUR = 61.0;

// voice line start times (lengths are in voice/dur.json)
export const VO = { l1: 0.8, l2: 5.4, l3: 13.6, l4: 21.2, l5: 28.6, l6: 34.8, l7: 42.0, l8: 47.6, l9: 53.0 };

export const T = {
  open: [0.0, 0.25, 0.5, 0.75],   // opening sheet prints block by block (key, blue, secondary, red)
  cart: { s0: 2.2, s1: 13.3, s2: 21.0, s3: 28.5, s4: 34.6, s5: 48.2 },
  pull: [2.0, 6.6],                // pull back from the bowl to the doorway
  hand: [7.4, 8.4],                // grandmother hands the bowl to Kenji
  bow: [9.2, 10.2], walk: [10.4, 12.8],
  slide1: [11.4, 13.0],            // the hanging scroll travels down: 1.6 s, 1.2 s, 0.9 s
  pour1: [16.9, 18.7],
  slide2: [19.5, 20.7],
  pour2: [24.8, 26.6],
  slide3: [27.4, 28.3],
  cry: [28.3, 31.9], pour3: [31.7, 33.5],
  cut4: 34.2,                      // hard cut: the city
  coins: [37.3, 38.3],
  wash: [39.6, 40.3],              // the print washes back to paper
  ma: [40.3, 42.2],                // absolute silence
  key5: 40.7,                      // the bowl's key line prints on the blank sheet
  blk: [43.4, 44.3, 45.4],         // rain blue, snow white-blue, lantern red land on the bowl
  zoom5: [46.0, 46.8],             // crash-zoom into the glaze's woodgrain
  dusk: [46.8, 47.05, 47.3, 47.55],// the doorway reprinted at dusk, block by block
  pour6: [49.9, 51.7],
  pullEnd: [52.6, 56.4],
  washEnd: [57.0, 58.3],
  bell: 58.4,
};

export const q8 = t => Math.floor(t * 8) / 8;     // figures and nature step at 8 fps
export const q12 = t => Math.floor(t * 12) / 12;  // rain at 12 fps
