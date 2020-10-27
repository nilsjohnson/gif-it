export default class ProgressTimer {
    constructor(uploadId, updateUploads, amountToUpload, rate, interval ) {
        this.uploadId = uploadId;
        this.updateUploads = updateUploads;
        this.amountToUpload = amountToUpload;
        this.rate = rate;
        this.interval = interval;
        this.totalUploaded = 0;
        this.uploadComplete = false;

        console.log('file size: ' + this.amountToUpload)
    }

    doProgressBar() {
        setTimeout(() => {
            if (this.totalUploaded >= this.amountToUpload)
            { 
                return; 
            }
            
            this.totalUploaded += this.rate;
            console.log("rate: " + this.rate);
            console.log("total up: " + this.totalUploaded);

            let percent = Math.round(this.totalUploaded / this.amountToUpload * 100);
            console.log(percent);
            percent = percent < 100 ? percent : 100;
           

            if(!this.uploadComplete) {
                this.updateUploads(this.uploadId, { percentUploaded: percent });
                
                // if we are less than 100% though this, we continue
                if(percent < 100) {
                    return this.doProgressBar();
                }
                // if we are 100%, we reached 100% before the upload was complete.
                return;
            }
            console.log("upload marked as complete. Done");
            // if the upload completed before we reached 100, we mark it as 100% and return.
            this.updateUploads(this.uploadId, { percentUploaded: 100 });
            return;

        }, this.interval);
    }

    setTotalUploaded(amount) {
        console.log("----- actual total amount received upldate -----")
        this.totalUploaded = amount;
    }

    setUploadComplete() {
        this.uploadComplete = true;
    }

    updateRate(rate) {
        console.log("----- upload rate update ------ ")
        this.rate = rate;
    }

}