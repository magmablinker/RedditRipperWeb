const ArgParser = class {

    constructor() {
        this.arguments = []
    }

    addArgument(name, callback) {
        this.arguments.push({
            name: name,
            callback: callback
        });
    }

    evaluate(command) {
        let callback;

        this.arguments.forEach(item => {
            if(command.includes(item.name)) {
                callback = item.callback;
            }
        });

        if(callback) {
            callback();
        } else {
            throw new InvalidCommandException("unrecognized command! Use 'help' to learn more.");
        }
    }

};

function InvalidCommandException(message) {
    this.message = message;
    this.name = "InvalidCommandException";
};

export default ArgParser;