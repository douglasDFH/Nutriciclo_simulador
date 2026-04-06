import { create } from 'zustand'

export interface MachineTransform {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

// ── Posiciones/rotaciones/escalas iniciales por equipo ────────────────────────
const DEFAULTS: Record<string, MachineTransform> = {
  // Fase 1
  marmita:       { position: [0,    0,    0], rotation: [0, 0, 0], scale: 1 },
  rotary_dryer:  { position: [2.5,  0.2,  0], rotation: [0, 0, 0], scale: 1 },
  screw_conveyor:{ position: [5,   -0.5,  0], rotation: [0, 0, 0], scale: 1 },
  rotary_kiln:   { position: [7.5,  0.3,  0], rotation: [0, 0, 0], scale: 1 },
  hammer_mill:   { position: [10,   0,    0], rotation: [0, 0, 0], scale: 1 },
  // Fase 2
  molasses_tank:    { position: [0,  0, 0], rotation: [0, 0, 0], scale: 1 },
  peristaltic_pump: { position: [3,  0, 0], rotation: [0, 0, 0], scale: 1 },
  dissolution_tank: { position: [6,  0, 0], rotation: [0, 0, 0], scale: 1 },
  transfer_pump:    { position: [9,  0, 0], rotation: [0, 0, 0], scale: 1 },
  ribbon_mixer:     { position: [12, 0, 0], rotation: [0, 0, 0], scale: 1 },
  // Fase 3
  paddle_mixer:   { position: [0,  0, 0], rotation: [0, 0, 0], scale: 1 },
  lime_dosifier:  { position: [3,  0, 0], rotation: [0, 0, 0], scale: 1 },
  vibrating_table:{ position: [6,  0, 0], rotation: [0, 0, 0], scale: 1 },
  belt_conveyor:  { position: [9,  0, 0], rotation: [0, 0, 0], scale: 1 },
  ventilation:    { position: [12, 0, 0], rotation: [0, 0, 0], scale: 1 },
  // Sub-proceso BSF
  bsf_bioreactor: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
  bsf_dryer:      { position: [4, 0, 0], rotation: [0, 0, 0], scale: 1 },
  bsf_mill:       { position: [8, 0, 0], rotation: [0, 0, 0], scale: 1 },
}

interface Store3D {
  transforms: Record<string, MachineTransform>
  setPosition: (id: string, p: [number, number, number]) => void
  setRotation: (id: string, r: [number, number, number]) => void
  setScale:    (id: string, s: number) => void
  resetAll:    () => void
  resetOne:    (id: string) => void
}

export const use3DStore = create<Store3D>((set) => ({
  transforms: structuredClone(DEFAULTS),

  setPosition: (id, p) =>
    set(s => ({ transforms: { ...s.transforms, [id]: { ...s.transforms[id], position: p } } })),

  setRotation: (id, r) =>
    set(s => ({ transforms: { ...s.transforms, [id]: { ...s.transforms[id], rotation: r } } })),

  setScale: (id, sc) =>
    set(s => ({ transforms: { ...s.transforms, [id]: { ...s.transforms[id], scale: sc } } })),

  resetAll: () =>
    set({ transforms: structuredClone(DEFAULTS) }),

  resetOne: (id) =>
    set(s => ({
      transforms: {
        ...s.transforms,
        [id]: structuredClone(DEFAULTS[id] ?? { position: [0,0,0], rotation: [0,0,0], scale: 1 }),
      },
    })),
}))
