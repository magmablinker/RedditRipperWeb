const CoreUtils = class {

    help() {
       window.stdout.write(`EPIC REDDIT RIPPER WEB CONSOLE
    - Commands:
        help: 'displays this message'
        add {subreddit}: 'adds a subreddit to the download list'`);
    }

    clear() {
        window.stdout.clear();
    }

};

export default CoreUtils;