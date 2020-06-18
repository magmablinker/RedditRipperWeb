const CoreUtils = class {

    clear() {
        window.stdout.clear();
    }

    echo() {
        let message = "";

        if(window.args) {
            if(window.args[0]) {
                for (let index = 0; index < window.args.length; index++) {
                    message += `${window.args[index]} `;
                }
            }
        }

        window.stdout.write(message);
    }

};

export default CoreUtils;