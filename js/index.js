import ArgParser from "./classes/ArgParser.js";
import CoreUtils from "./classes/CoreUtils.js";
import RedditRipper from "./classes/RedditRipper.js";

var app = new Vue({
    el: "#root",
    data: {
        console: "",
        command: "",
        stdout: [],
        commandHistory: [],
        argParser: new ArgParser(),
        coreUtils: new CoreUtils(),
        redditRipper: new RedditRipper(),
        showInput: true
    },
    methods: {
        pushCommand() {
            this.writeToStdOut("root@RedditRipper:~# " + this.command);

            this.argParser.evaluate(this.command).catch(e => {
                this.writeToStdOut(`Error: ${e.message}`);
            });

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
            this.saveCommandHistory();
        },
        clearStdOut() {
            this.stdout = [];
        },
        inputVisible(bool) {
            this.showInput = bool;
        },
        focusInput() {
            this.$refs.commandInput.focus();
        },
        loadCommandHistory() {
            try {
                let data = localStorage.getItem("commandHistory");

                if(data) {
                    this.commandHistory = JSON.parse(data);
                }
            } catch(e) {
                this.writeToStdOut(`Error: your browser doesn't support local storage. Please consider using a more modern browser.`);
            }
        },
        saveCommandHistory() {
            try {
                localStorage.setItem("commandHistory", JSON.stringify(this.commandHistory));
            } catch(e) {
                this.writeToStdOut(`Error: your browser doesn't support local storage. Please consider using a more modern browser.`);
            }
        }
    },
    updated() {
        this.$nextTick(() => {
            this.scrollToBottom();
        });
    },
    mounted() {
        this.loadCommandHistory();

        window.stdout = {
            write: this.writeToStdOut,
            clear: this.clearStdOut
        };

        window.showInput = this.inputVisible;

        this.argParser.addArgument("clear", this.coreUtils.clear, "clears the previous terminal output");
        this.argParser.addArgument("add", this.redditRipper.addSubreddit, "add a subreddit to the download list, usage: add {subreddit}");
        this.argParser.addArgument("rm", this.redditRipper.removeSubreddit, "removes a subreddit from your download list, usage: remove {subreddit}");
        this.argParser.addArgument("ls", this.redditRipper.listSubreddits, "lists all subreddits in your download list");
        this.argParser.addArgument("redditripper.js", this.redditRipper.downloadSubreddits, "starts the download process");

        this.focusInput();
    }
});

export default app;