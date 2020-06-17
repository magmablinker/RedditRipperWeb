import app from '../index.js'

const RedditRipper = class {

    constructor() {
        this.subreddits = [];
    }

    addSubreddit() {
        // TODO: Add check for subreddit exists
        if(window.args) {
            if(window.args[0]) {
                app.$data.redditRipper.subreddits.push(window.args[0]);
            } else {
                throw new InvalidUsageException(`argument 'subreddit' missing`);
            }
        }
    }

    async downloadSubreddits() {
        let urls = await app.$data.redditRipper.getImageUrls();
        
        await app.$data.redditRipper.downloadImages(urls);
    }

    async getImageUrls() {
        const urls = [];

        for (let index = 0; index < app.$data.redditRipper.subreddits.length; index++) {
            const subreddit = app.$data.redditRipper.subreddits[index];
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

    async downloadImages(urls) {
        for (let index = 0; index < urls.length; index++) {
            /*
             * Fix this stupid bug
             * Access to XMLHttpRequest at 'https://i.redd.it/wsh3p33g1b551.jpg' from origin 'dadfsadfs' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
             */
            if(!urls[index].includes("gifv")) {
                window.stdout.write(`[+] downloading image ${urls[index]}`);
                await axios.get(urls[index])
                .then(response => {
                    let fileURL = window.URL.createObjectURL(new Blob([response.data]));
                    let link = document.createElement('a');
                    link.href = fileURL;
                    link.download = urls[index].substring(urls[index].lastIndexOf("/") + 1);
    
                    document.body.appendChild(link);
    
                    link.click();
    
                    document.body.removeChild(link);
                })
                .catch(error => {
                    console.log(error);
                });        
            }
        }
    }

    listSubreddits() {
        for (let index = 0; index < app.$data.redditRipper.subreddits.length; index++) {
            window.stdout.write(app.$data.redditRipper.subreddits[index]);
        }
    }

};

function InvalidUsageException(message) {
    this.name = "InvalidUsageException";
    this.message = message;
}

export default RedditRipper;