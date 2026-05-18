import jsonpointer from 'jsonpointer';

function normalize(pointer: string): string {
  return pointer.startsWith('#') ? pointer.slice(1) : pointer;
}

function get(obj: unknown, pointer: string): unknown {
  return jsonpointer.get(obj as object, normalize(pointer));
}

function set(obj: unknown, pointer: string, value: unknown, _force?: boolean): void {
  jsonpointer.set(obj as object, normalize(pointer), value as any);
}

function unset(obj: unknown, pointer: string): void {
  jsonpointer.set(obj as object, normalize(pointer), undefined);
}

function flatten(target: unknown, withArrayIndices = false): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function walk(current: unknown, path: string): void {
    result[path] = current;
    if (current !== null && typeof current === 'object') {
      if (Array.isArray(current)) {
        if (withArrayIndices) {
          (current as unknown[]).forEach((item, i) => walk(item, `${path}/${i}`));
        }
      } else {
        for (const key of Object.keys(current as Record<string, unknown>)) {
          walk((current as Record<string, unknown>)[key], `${path}/${key}`);
        }
      }
    }
  }

  if (target !== null && typeof target === 'object') {
    if (Array.isArray(target)) {
      if (withArrayIndices) {
        (target as unknown[]).forEach((item, i) => walk(item, `/${i}`));
      }
    } else {
      for (const key of Object.keys(target as Record<string, unknown>)) {
        walk((target as Record<string, unknown>)[key], `/${key}`);
      }
    }
  }

  return result;
}

export const JsonPointer = { get, set, unset, flatten };
