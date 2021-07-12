export enum VeoErrorTypes {
  VEO_ERROR_COMMON,
  VEO_ERROR_NOT_FOUND,
  VEO_ERROR_NOT_AUTHORIZED
}

export class VeoError extends Error {
  constructor(public message: string, public code: number = 500, public type: VeoErrorTypes = VeoErrorTypes.VEO_ERROR_COMMON) {
    super(message);

    Object.setPrototypeOf(this, VeoError.prototype);
  }

  toString() {
    return `VeoError: ${this.message} (${VeoErrorTypes[this.type]})\n\tat: ${this.stack}`;
  }
}
