const app = new Vue({
    el: "#root",
    data: {
        console: "",
        command: "",
        stdout: []
    },
    methods: {
        pushCommand() {
            let functionToCall = this.parseCommand();
            
            this.stdout.push("root@RedditRipper:~# " + this.command);
            this.command = "";

            functionToCall();
        },
        parseCommand() {
            let functionToCall;

            switch(this.command) {
                case "help":
                    break;
                default:
                    functionToCall = this.invalidCommand;
                    break;
            }

            return functionToCall;
        },
        invalidCommand() {
            this.stdout.push("Error: unrecognized command! Use 'help' to learn more.")
        },
        scrollToBottom() {
            this.$refs.console.scrollTop = this.$refs.console.scrollHeight + 200;
        }
    },
    updated() {
        this.$nextTick(() => this.scrollToBottom());
    },
});