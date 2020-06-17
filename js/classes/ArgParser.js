import app from '../index.js'

const ArgParser = class {

    constructor() {
        this.arguments = []
        this.arguments.push({
            name: "help",
            callback: this.help,
            description: "displays the help command"
        });
    }

    addArgument(name, callback, description) {
        this.arguments.push({
            name: name,
            callback: callback,
            description: description
        });
    }

    async evaluate(command) {
        let callback;

        for(let i = 0; i < this.arguments.length; i++) {
            let item = this.arguments[i];

            if(command.startsWith(item.name)) {
                window.args = command.replace(item.name, "").split(" ").filter(item => item != "");
                callback = item.callback;
            }
        }

        if(callback) {
            window.showInput(false);
            await callback();
            window.showInput(true);
        } else {
            throw new InvalidCommandException("unrecognized command! Use 'help' to learn more.");
        }
    }

    help() {
        window.stdout.write("\n");
        window.stdout.write("EPIC REDDIT RIPPER WEB CONSOLE");
        window.stdout.write("   - Commands:");

        for(let i = 0; i < app.$data.argParser.arguments.length; i++) {
            let item = app.$data.argParser.arguments[i];
            window.stdout.write(`       ${item.name}: '${item.description}'`);
        }

        window.stdout.write("\n");
    }

};

function InvalidCommandException(message) {
    this.message = message;
    this.name = "InvalidCommandException";
};

export default ArgParser;