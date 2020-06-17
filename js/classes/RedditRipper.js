import app from '../index.js'

const RedditRipper = class {

    constructor() {
        this.subreddits = [];
        this.loadSubreddits();
    }

    addSubreddit() {
        // TODO: Add check for subreddit exists
        if(window.args) {
            if(window.args[0]) {
                app.$data.redditRipper.subreddits.push(window.args[0]);
                app.$data.redditRipper.saveSubreddits();
            } else {
                throw new InvalidUsageException(`argument 'subreddit' missing`);
            }
        }
    }

    removeSubreddit() {
        if(window.args) {
            if(window.args[0]) {
                app.$data.redditRipper.subreddits = app.$data.redditRipper.subreddits.filter(item => item != window.args[0]);
                app.$data.redditRipper.saveSubreddits();
                window.stdout.write("the subreddit has been removed from your list!");
            } else {
                throw new InvalidUsageException(`argument 'subreddit' missing`);
            }
        }
    }

    loadSubreddits() {
        try {
            let data = localStorage.getItem("subreddits");

            if(data) {
                this.subreddits = JSON.parse(data);
            }
        } catch(e) {
            this.writeToStdOut(`Error: your browser doesn't support local storage. Please consider using a more modern browser.`);
        }
    }

    saveSubreddits() {
        try {
           localStorage.setItem("subreddits", JSON.stringify(app.$data.redditRipper.subreddits));
        } catch(e) {
            this.writeToStdOut(`Error: your browser doesn't support local storage. Please consider using a more modern browser.`);
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

            urls.push({
                subreddit: subreddit,
                urls: []
            });

            await axios.get(url)
                    .then(response => {
                        if(response.data.data.children < 1) {
                            throw new InvalidUsageException(`subreddit ${subreddit} doesn't exist!`);
                        }

                        for (let i = 0; i < response.data.data.children.length; i++) {
                            const element = response.data.data.children[i];
                            urls[index].urls.push(element.data.url);
                        }
                    })
                    .catch(error => console.log(error));
        }

        return urls;
    }

    async downloadImages(subreddits) {
        let allowedFileTypes = [".jpg", ".jpeg", ".gif", ".png"];

        for (let index = 0; index < subreddits.length; index++) {
            let zip = new JSZip();

            for(let j = 0; j < subreddits[index].urls.length; j++) {
                let isValidFileType = false;

                for (let i = 0; i < allowedFileTypes.length; i++) {
                    if(subreddits[index].urls[j].includes(allowedFileTypes[i])) {
                        isValidFileType = true;
                        break;
                    }
                }
    
                if(isValidFileType) {
                    window.stdout.write(`[+] downloading image ${subreddits[index].urls[j]}`);

                    await axios.get(`https://cors-anywhere.herokuapp.com/${subreddits[index].urls[j]}`, {
                        responseType: 'blob'
                    })
                    .then(response => {
                        if(response.data) {
                            zip.file(subreddits[index].urls[j].substring(subreddits[index].urls[j].lastIndexOf("/") + 1), response.data, {
                                binary: true
                            });
                        }
                    })
                    .catch(error => console.log(error));
                } else {
                    window.stdout.write(`url ${subreddits[index].urls[j]} contains invalid file type`);
                }
            }

            await zip.generateAsync({
                type: 'blob'
            }).then((content) => {
                var uriContent = URL.createObjectURL(content);

                let downloadLink = document.createElement("a");
                downloadLink.download = subreddits[index].subreddit + ".zip";
                downloadLink.href = uriContent;

                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            });
        }
    }

    toDataURL(url) {
        return fetch(url).then((response) => {
            return response.blob();
        }).then(blob => {
            return URL.createObjectURL(blob);
        });
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