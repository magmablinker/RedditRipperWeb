import ArgParser from "./classes/ArgParser.js";
import CoreUtils from "./classes/CoreUtils.js";
import RedditRipper from "./classes/RedditRipper.js";
import YoutubeDownload from "./classes/YoutubeDownload.js";

var app = new Vue({
    el: "#root",
    data: {
        clock: "",
        console: "",
        command: "",
        stdout: [],
        commandHistory: [],
        historyIndex: 0,
        argParser: new ArgParser(),
        coreUtils: new CoreUtils(),
        redditRipper: new RedditRipper(),
        youtubeDownload: new YoutubeDownload(),
        showInput: true,
        proxyUrl: "https://cors-anywhere.herokuapp.com/"
    },
    methods: {
        getClock() {
            let date = new Date();
            this.clock = `${this.zeroPadding(date.getHours(), 2)}:${this.zeroPadding(date.getMinutes(), 2)}:${this.zeroPadding(date.getSeconds(), 2)}`
        },
        zeroPadding(num, digit) {
            let zero = '';

            for(let i = 0; i < digit; i++) {
                zero += '0';
            }

            return (zero + num).slice(-digit);
        },
        pushCommand() {
            this.writeToStdOut("root@webconsole:~# " + this.command);

            if(this.command) {
                this.argParser.evaluate(this.command).then(result => {
                    this.addToCommandHistory();
                }).catch(e => {
                    this.writeToStdOut(`Error: ${e.message}`);
                })
                .finally(() => {
                    this.command = "";
                    this.showInput = true;
                });
            }
        },
        writeToStdOut(message) {
            if(this.stdout.length > 60) {
                this.stdout = this.stdout.splice(1, this.stdout.length);
            }

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
            this.historyIndex = this.commandHistory.length - 1;
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
                    this.historyIndex = this.commandHistory.length - 1;
                }
            } catch(e) {
                this.writeToStdOut(`Error: your browser doesn't support local storage. Please consider using a more modern browser.`);
            }
        },
        saveCommandHistory() {
            try {
                localStorage.setItem("commandHistory", JSON.stringify(this.commandHistory));
                this.historyIndex = this.commandHistory.length - 1;
            } catch(e) {
                this.writeToStdOut(`Error: your browser doesn't support local storage. Please consider using a more modern browser.`);
            }
        },
        historyUp() {
            if(this.historyIndex > 0) {
                this.command = this.commandHistory[this.historyIndex];
                this.historyIndex--;
            }
        },
        historyDown() {
            if(this.historyIndex < this.commandHistory.length) {
                this.command = this.commandHistory[this.historyIndex];
                this.historyIndex++;
            }
        }
    },
    updated() {
        this.$nextTick(() => {
            this.scrollToBottom();
        });
    },
    mounted() {
        setInterval(() => {
            this.getClock();
        }, 1000);

        this.loadCommandHistory();

        window.stdout = {
            write: this.writeToStdOut,
            clear: this.clearStdOut
        };

        window.showInput = this.inputVisible;

        this.argParser.addArgument("clear", this.coreUtils.clear, {}, "clears the previous terminal output");
        this.argParser.addArgument("echo", this.coreUtils.echo, {}, "prints a text to stdout, usage: echo {message}")
        this.argParser.addArgument("add", this.redditRipper.addSubreddit, {}, "add a subreddit to the download list, usage: add {subreddit}");
        this.argParser.addArgument("rm", this.redditRipper.removeSubreddit, {}, "removes a subreddit from your download list, usage: rm {subreddit/index}");
        this.argParser.addArgument("ls", this.redditRipper.listSubreddits, {}, "lists all subreddits in your download list");
        this.argParser.addArgument("redditdl", this.redditRipper.downloadSubreddits, { "limit": 50, "category": "hot", "subreddit": undefined }, `starts the download process
              - can be called with the arguments: 
                * limit {limit} (0-100)
                * category {category} (allowed categories are hot, top, new) 
                * subreddit {subreddit} (to download a single subreddit).`);

        this.focusInput();
    }
});

export default app;