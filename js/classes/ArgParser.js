import app from '../index.js'

const ArgParser = class {

    constructor() {
        this.arguments = []

        this.addArgument(
            "help",
            this.help,
            {},
            "displays the help command"
        );
    }

    addArgument(name, callback, args, description) {
        this.arguments.push({
            name: name,
            callback: callback,
            args: args,
            description: description
        });
    }

    async evaluate(command) {
        let callback;

        for(let i = 0; i < this.arguments.length; i++) {
            let item = this.arguments[i];

            if(command.startsWith(item.name)) {
                window.args = {};

                let args = command.replace(item.name, "").split(" ").filter(item => item != "");
                let argumentNames = item.args;

                if(Object.keys(argumentNames).length > 0) {
                    if(args.length > 0) {
                        for (let index = 0; index < args.length; index++) {
                            const arg = args[index];
    
                            for(let key of Object.keys(argumentNames)) {
                                const argument = argumentNames[key];
    
                                if(arg == key) {
                                    if(args[args.indexOf(key) + 1])
                                        window.args[key] = args[args.indexOf(key) + 1];
                                    else
                                        throw new InvalidCommandException(`invalid usage argument missing for '${key}'. Use 'help' to learn more.`);
                                }
                            }
                        }

                        // Check if argument with default value is missing
                        // and add it if necessary
                        for(let key of Object.keys(argumentNames)) {
                            if(!(key in window.args)) {
                                if(argumentNames[key])
                                    window.args[key] = argumentNames[key];
                            }
                        }
                    } else {
                        window.args = argumentNames;
                    }
                } else {
                    window.args = args;
                }

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
        window.stdout.write("EPIC WEB CONSOLE");
        window.stdout.write(`
 _          _       
| |        | |      
| |__   ___| |_ __  
| '_ \\ / _ \\ | '_ \\ 
| | | |  __/ | |_)|
|_| |_|\\___|_| .__/ 
             | |    
             |_|`);
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