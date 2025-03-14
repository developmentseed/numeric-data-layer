import type { Array, DataType, FetchStore, Chunk } from "zarrita";

// Is this really better than Math.max/min
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
