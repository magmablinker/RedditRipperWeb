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

        for(let i = 0; i < this.arguments.length; i++) {
            let item = this.arguments[i];

            if(command.startsWith(item.name)) {
                window.args = command.replace(item.name, "").split(" ").filter(item => item != "");
                callback = item.callback;
            }
        }

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