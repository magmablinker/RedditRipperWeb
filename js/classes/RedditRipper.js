import app from '../index.js';

const RedditRipper = class {

    constructor() {
        this.subreddits = [];
        this.loadSubreddits();
    }

    addSubreddit() {
        // TODO: Add check for subreddit exists
        if (window.args) {
            if (window.args[0]) {
                if(!app.$data.redditRipper.subreddits.includes(window.args[0])) {
                    app.$data.redditRipper.subreddits.push(window.args[0]);
                    app.$data.redditRipper.saveSubreddits();
                } else {
                    window.stdout.write(`subreddit ${window.args[0]} is already in download list`);
                }
            } else {
                throw new InvalidUsageException(`argument 'subreddit' missing`);
            }
        }
    }

    removeSubreddit() {
        if (window.args) {
            let index = -1;

            if (window.args[0]) {
                // Check if it is a number or string
                if (parseFloat(window.args[0]) == window.args[0]) {
                    if (app.$data.redditRipper.subreddits[window.args[0]]) {
                        index = window.args[0]
                    }
                } else {
                    index = app.$data.redditRipper.subreddits.indexOf(window.args[0]);
                }
            }

            if (index > -1) {
                let removeName = app.$data.redditRipper.subreddits[index];
                app.$data.redditRipper.subreddits.splice(index, 1);
                window.stdout.write(`the subreddit '${removeName}' has been removed from your list!`);
                app.$data.redditRipper.saveSubreddits();
            } else {
                throw new InvalidUsageException(`invalid subbreddit/index`);
            }
        } else {
            throw new InvalidUsageException(`argument 'subreddit' missing`);
        }
    }

    loadSubreddits() {
        try {
            let data = localStorage.getItem("subreddits");

            if (data) {
                this.subreddits = JSON.parse(data);
            }
        } catch (e) {
            this.writeToStdOut(`Error: your browser doesn't support local storage. Please consider using a more modern browser.`);
        }
    }

    saveSubreddits() {
        try {
            localStorage.setItem("subreddits", JSON.stringify(app.$data.redditRipper.subreddits));
        } catch (e) {
            this.writeToStdOut(`Error: your browser doesn't support local storage. Please consider using a more modern browser.`);
        }
    }

    async downloadSubreddits() {
        if(app.$data.redditRipper.subreddits.length > 0) {
            let urls;

            if(!window.args.subreddit) {
                urls = await app.$data.redditRipper.getImageUrls(window.args.category, window.args.limit, app.$data.redditRipper.subreddits);
            } else {
                urls = await app.$data.redditRipper.getImageUrls(window.args.category, window.args.limit, [ window.args.subreddit ]);
            }
    
            await app.$data.redditRipper.downloadImages(urls);
        } else {
            window.stdout.write(`No subreddits found! Add one with the command 'add {subreddit}'`);
        }
    }

    async getImageUrls(category, limit, subreddits) {
        const urls = [];

        for (let index = 0; index < subreddits.length; index++) {
            const subreddit = subreddits[index];
            let url = `https://api.reddit.com/r/${subreddit}/${category}?limit=${limit}`

            urls.push({
                subreddit: subreddit,
                urls: []
            });

            window.stdout.write(`[+] fetching images for subreddit ${subreddit}`);

            await axios.get(url)
                .then(response => {
                    if (response.data.data.children < 1) {
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
            let files = 0;

            for (let j = 0; j < subreddits[index].urls.length; j++) {
                let isValidFileType = false;

                for (let i = 0; i < allowedFileTypes.length; i++) {
                    if (subreddits[index].urls[j].includes(allowedFileTypes[i])) {
                        isValidFileType = true;
                        break;
                    }
                }

                if (isValidFileType && !subreddits[index].urls[j].includes("gifv")) {
                    window.stdout.write(`[+] downloading image ${subreddits[index].urls[j]}`);

                    let url = `${subreddits[index].urls[j]}`;

                    if(!url.includes("imgur")) {
                        url = `${app.$data.proxyUrl}${subreddits[index].urls[j]}`;
                    }

                    await axios.get(url, {
                        responseType: 'blob',
                        'Cache-Control': null,
                        'X-Requested-With': null
                    })
                        .then(response => {
                            if (response.data) {
                                zip.file(subreddits[index].urls[j].substring(subreddits[index].urls[j].lastIndexOf("/") + 1), response.data, {
                                    binary: true
                                });
                                files++;
                            }
                        })
                        .catch(error => console.log(error));
                } else {
                    window.stdout.write(`[!] url ${subreddits[index].urls[j]} contains invalid file type`);
                }
            }

            window.stdout.write(`[+] generating zip file for the subreddit ${subreddits[index].subreddit}`);

            if(files > 0) {
                await zip.generateAsync({
                    type: 'blob',
                    compression: "DEFLATE"
                }).then((content) => {
                    var uriContent = URL.createObjectURL(content);
    
                    let downloadLink = document.createElement("a");
                    downloadLink.download = subreddits[index].subreddit + ".zip";
                    downloadLink.href = uriContent;
    
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                });
            } else {
                window.stdout.write(`[!] failed to download subreddit ${subreddits[index].subreddit}`);
            }
        }
    }

    listSubreddits() {
        if(app.$data.redditRipper.subreddits.length > 0) {
            for (let index = 0; index < app.$data.redditRipper.subreddits.length; index++) {
                window.stdout.write(`[${index}] ${app.$data.redditRipper.subreddits[index]}`);
            }
        } else {
            window.stdout.write(`No subreddits found! Add one with the command 'add {subreddit}'`);
        }
    }

};

function InvalidUsageException(message) {
    this.name = "InvalidUsageException";
    this.message = message;
}

export default RedditRipper;