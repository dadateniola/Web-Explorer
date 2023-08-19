class Comments {
    constructor(params = {}) { }

    static getComment() {
        this.setupParams(arguments)

        this.comments = {
            doesntExist: "the file path doesn't exist or it doesn't allow read or write access.",
            noAccess: `the specified directory or folder you are attempting to open does not give us full permissions as it is outside of the ${this?.txt} folder.we can still read through the files but we won't be able to make changes to them or even display their contents, thank you.`,
            empty: 'file path is empty',
            issue: 'there was an issue getting the files.',
        }
        let comment = this.getType();

        return (comment) ? comment : this.default;
    }

    static setupParams(params = {}) {
        this.default = 'no comment';
        this.type = this.default;
        
        if (typeof params == 'object') {
            this.type = params[0];
            this.txt = params[1]
        }
        else this.type = params;
    }

    static getType() {
        for (const key in this.comments) if(this.type == this.checkComments(key)) return this.comments[key]
    }

    static checkComments(key) {
        return key.replace(/([A-Z])/g, ' $1').toLowerCase();
    }
}

module.exports = Comments;