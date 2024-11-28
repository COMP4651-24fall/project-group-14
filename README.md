# COMP 4651 Course Project

This is a project for COMP 4651 - Cloud Computing and Big Data Systems at HKUST. 

# Installation & Running

To clone and run this on your own, you must have Node.js and `npm` installed. The project uses AWS SDK V3, which makes use of webpack. 
To install webpack, one should run the following:

```bash
npm install --save-dev webpack
```

```bash
npm install --save-dev path-browserify
```

```bash
npm install webpack-cli
```

Next, one shall install Amazon Polly service with
```bash
npm install @aws-sdk/client-polly
```

Running `npm run build` bundles all JS code in `type.js` and Amazon services JS code into two files called `bundle.js` and `207.bundle.js`. 

These 2 files **are not committed nor pushed to this repository** and `bundle.js` is the one imported in `type.html` instead of `type.js`.

Note 1: The identity pool ID is not committed nor pushed to the repository. When running the project, replace `"INSERT ID"` with the ID in `type.js`.\
**Note 2: Every time `type.js` is updated, rerun `npm run build`. This is so that `bundle.js` is updated for the webpage.**

# Launching the game on an Amazon EC2 Instance
If one desires to host this game on an Amazon instance, run the following steps:
1. Create/Make sure you have a security group that allows any IPv4 address (or specfic ones) via HTTP, and allows specific IPs (yours/all) to SSH in.
2. Create an EC2 instance with Ubuntu 22.04 as the OS (Others might work, but they have not been tested)
3. Choose `t2.micro` as the instance type, choose the security group and launch it.
4. SSH into the instance and upload the following files to a directory under home (`~`) with `scp`:
   1. `images/bee.png`
   2. `images/clouds.png`
   3. `index.html`
   4. `type.html`
   5. `styles.css`
   6. `bundle.js`
   7. `207.bundle.js`

   Remember to keep the structure (i.e. the PNG files should be in a directory named `images`)
5. Before uploading `bundle.js` and `207.bundle.js`, make sure you replace the identity pool key in `type.js` and run `npm run build` (creating the updated version of the 2 JS files).
6. Update the OS with `sudo apt update`.
7. Install Apache with `sudo apt install apache2`.
8. Run `sudo rm /var/www/html/index.html` to remove Apache's default `index.html` in `/var/www/html/`. (The directory is write-protected)
9. Move everything you uploaded into `/var/www/html/` using `sudo mv`.
10. Copy the public IP of the instance and access it with a browser.

# References
### Set-up:
[Set up the SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-up.html#jssdk-prerequisites)\
[Webpack bundling & configuration](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/webpack.html)

### Word list:
The word list used in this project ([here](./words.txt)) is taken from [this Scrabble project](https://github.com/raun/Scrabble/blob/master/words.txt).


