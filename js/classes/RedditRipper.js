const RedditRipper = class {

    constructor() {
        this.subreddits = [];
        window.objInstance = this; // Not so cool pls fix mfg
    }

    addSubreddit() {
        // TODO: Add check for subreddit exists
        if(window.args) {
            if(window.args[0]) {
                objInstance.subreddits.push(window.args[0]);
            } else {
                throw new InvalidUsageException(`argument 'subreddit' missing`);
            }
        }
    }

    async downloadSubreddits() {
        let urls = await objInstance.getImageUrls();
        console.log(urls);
    }

    async getImageUrls() {
        const urls = [];

        for (let index = 0; index < objInstance.subreddits.length; index++) {
            const subreddit = objInstance.subreddits[index];
            let url = `http://api.reddit.com/r/${subreddit}/hot?limit=10`   

            await axios.get(url)
                    .then(response => {
                        if(response.data.data.children < 1) {
                            throw new InvalidUsageException(`subreddit ${subreddit} doesn't exist!`);
                        }

                        for (let index = 0; index < response.data.data.children.length; index++) {
                            const element = response.data.data.children[index];
                            urls.push(element.data.url);
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })

        }

        return urls;
    }

};

function InvalidUsageException(message) {
    this.name = "InvalidUsageException";
    this.message = message;
}

export default RedditRipper;