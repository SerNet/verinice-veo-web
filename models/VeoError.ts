export default class VeoError extends Error {
    constructor(name: string, public cause?: Error) {
        super(name);
    }
}