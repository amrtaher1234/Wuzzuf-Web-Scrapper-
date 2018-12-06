# Wuzzuf Scraper

- hello everyone, this is a simple crawler to fetch jobs that includes salary ranges, using this is fairly simple.
- (https://www.linkedin.com/feed/update/urn:li:activity:6475722957569163266)[Link to Demo] 

## installation guides: 

- first, you need to install node. You can download it by going to their website here https://nodejs.org/en/
- now you need to install our main library that opens headless chrome, puppeteer. Open the cmd and type ``` npm install puppeteer -g ``` to install it globally in your machine.
- now clone this repo in any folder you have and open the cmd or visual code there and type in the cmd/visual code terminal ``` npm i ``` to install the required packages in the package.json


## running guides:

- in order to have this crawler work for you, you need to pass your wuzzuf.com credentials in the credentials.json file. There is an object there to fill your email and password, you can trace the code there is no actual capturing of the json data or any sort of saving such data to any sort of database.
- after doing that you can add credentials to your database repo in firebaseConfig.json and do not forget to enable firstore in that repo as the code saves data to it.
- in the cmd type ``` node ./index.js ```, this will open a chromium application and it will start crawling the website, it will take 1-3 minutes to fetch the data.


## modification guides: 

- there is a declaration.js file which includes settings to the code, for example there is a limit to the number of scrolling the code will run in the website, the bigger the number the more jobs it will fetch but it will take more time to do so.
- there is a function in the index.js file called ``` savingData() ``` , you can in this function implement a method to save your jobs anywhere instead of a firebase repo or even extract it to a json file, whatever you like.



Finally, feel free to modify the code and add more functionality to it, after all this is why Open Source exists.