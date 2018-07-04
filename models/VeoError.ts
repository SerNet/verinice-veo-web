export default class VeoError extends Error {
    constructor(public name: string, public cause?: Error) {
        super(name);
        Object.defineProperty(this,'message',{
            get: function() {
                return 'ERRO!';
            },
            set: function(value) {
                throw new Error('Set error');
            }
        });
    }


}