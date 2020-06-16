import ArgParser from "./classes/ArgParser.js";
import CoreUtils from "./classes/CoreUtils.js";

const app = new Vue({
    el: "#root",
    data: {
        console: "",
        command: "",
        stdout: [],
        commandHistory: [],
        argParser: new ArgParser()
    },
    methods: {
        pushCommand() {
            this.writeToStdOut("root@RedditRipper:~# " + this.command);

            try {
                this.argParser.evaluate(this.command);
            } catch(e) {
                this.writeToStdOut(`Error: ${e.message}`);
            }

            this.addToCommandHistory();
            this.command = "";
        },
        writeToStdOut(message) {
            this.stdout.push(message)
        },
        scrollToBottom() {
            this.$refs.console.scrollTop = this.$refs.console.scrollHeight + 200;
        },
        addToCommandHistory() {
            if(this.commandHistory.length > 40) {
                this.commandHistory = this.commandHistory.splice(1, this.commandHistory.length);
            }

            this.commandHistory.push(this.command);
        },
        clearStdOut() {
            this.stdout = [];
        }
    },
    updated() {
        this.$nextTick(() => this.scrollToBottom());
    },
    mounted() {
        window.stdout = {
            write: this.writeToStdOut,
            clear: this.clearStdOut
        };

        let coreUtils = new CoreUtils();

        this.argParser.addArgument("help", coreUtils.help);
        this.argParser.addArgument("clear", coreUtils.clear);
    }
});