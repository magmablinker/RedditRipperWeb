const CoreUtils = class {

    clear() {
        window.stdout.clear();
    }

    echo() {
        let message = "";

        if(window.args) {
            if(window.args[0]) {
                message = window.args.join(" ");
            }
        }

        window.stdout.write(message);
    }

};

export default CoreUtils;
