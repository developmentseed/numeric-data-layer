import type {
  Array,
  DataType,
  FetchStore,
  TypedArray,
  NumberDataType,
} from "zarrita";

export const ENCODING_KEY = Math.pow(255, 2) + 255;

// Native Math function can be slow when element number is more than a specific threshold
export async function findMinMax(
  arr: Array<DataType, FetchStore>
): Promise<{ min: number; max: number } | undefined> {
  if (arr.is("number")) {
    const chunkForScale = await arr.getChunk([0, 0, 0]);

    const { data: typedArray } = chunkForScale;

    let min = Infinity;
    let max = -Infinity;
    let initialized = false;

    for (let i = 0; i < typedArray.length; i++) {
      const value = typedArray[i];
      if (!isNaN(value)) {
        if (!initialized) {
          min = max = value;
          initialized = true;
        } else {
          min = value < min ? value : min;
          max = value > max ? value : max;
        }
      }
    }

    // Handle case where all values might be NaN
    if (!initialized) {
      return { min: NaN, max: NaN };
    }

    return { min, max };
    // @TODO: What to do when the data is not numeric?
  } else {
    console.warn("Data is not number.");
    return;
  }
}

const RANGE = 255;
const RANGE_SQUARED = RANGE * RANGE;
const RANGE_TRIPLE_SQUARED = RANGE * RANGE * RANGE;
const MAX_RANGE = RANGE_TRIPLE_SQUARED + RANGE_SQUARED + RANGE;

export function encodeUsingMaximumRange(
  encoded: number
): [number, number, number] {
  const r = Math.floor(encoded / RANGE_SQUARED);
  const remainder = encoded % RANGE_SQUARED;
  const g = Math.floor(remainder / RANGE);
  const b = remainder % RANGE;
  return [r, g, b];
}

// Helper function to map a single value from [minInput, maxInput] to [0, 255]
export function numberArrayToUint8ClampedArray(
  arr: TypedArray<NumberDataType>,
  minVal: number,
  maxVal: number
) {
  const visualResult = new Uint8ClampedArray(arr.length * 4);

  for (let i = 0; i < arr.length; i++) {
    const dv = arr[i];
    const offset = i * 4;

    if (isNaN(dv)) {
      // nodata value
      visualResult[offset] = 0; // R
      visualResult[offset + 1] = 0; // G
      visualResult[offset + 2] = 0; // B
      visualResult[offset + 3] = 0; // A
    } else {
      // Normalize, clamp to [0, 255] and round
      const normalized = ((dv - minVal) / (maxVal - minVal)) * MAX_RANGE;
      const [r, g, b] = encodeUsingMaximumRange(normalized);
      visualResult[offset] = r;
      visualResult[offset + 1] = g;
      visualResult[offset + 2] = b;
      visualResult[offset + 3] = 255;
    }
  }
  return visualResult;
}
