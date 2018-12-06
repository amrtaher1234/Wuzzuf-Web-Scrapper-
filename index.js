const puppeteer = require('puppeteer');
const firebase = require('firebase'); 
const fs = require('fs'); 
const declarations = require('./declarations'); 
const firebaseFunctions = require('./firebase')

const config = JSON.parse(fs.readFileSync('./firebaseConfig.json')); 
const credentials = JSON.parse(fs.readFileSync('./credentials.json')); 


firebase.initializeApp(config); 

const firestore = firebase.firestore(); 
const settings = { timestampsInSnapshots: true};
firestore.settings(settings);



function delay(num){
  return new Promise((resp , rej)=>{
    setTimeout(() => {
      resp(); 
    }, num);
  })
}

class Job{
  constructor(title , salary , company , url , imgURL ){
    this.title = title ; 
    this.company = company ; 
    this.salary = salary ; 
    this.url = url ;
    this.imgURL = imgURL; 
  }
}

(async () => {
  // awaiting to delete all docs stored in db first
  await firebaseFunctions.deleteAll();

  // launching the chrome browser

  const browser = await puppeteer.launch(
    {headless : true})
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto('https://wuzzuf.net/explore')

  // signing into my websit
  const email = await page.waitFor('#input-signin-email');
  const password = await page.waitFor("#input-signin-password"); 
  const signbtn = await page.waitFor('.btn-signin'); 
  await email.type(credentials.email); 
  await password.type(credentials.password);
  await signbtn.click(); 
  

  // waiting for meaningful data of jobs to appear 
  const k = await page.waitFor('.css-p0kzya'); 




  // to scroll down to fetch more jobs in the screen 
  for(let i =0; i<declarations.settings.ScrollLimit; i++){
  await page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight);
  });
  await delay(1500); 
}


  // fetch all links to jobs in the page
  const hrefs = await page.evaluate(() => {
    const anchors = document.querySelectorAll('a.css-1lwywsz');
    return [].map.call(anchors, a => a.href);
  });
  console.log(hrefs); 
  let salaries = [];  
  let Jobs = [] ;
  const Promises = []; 

  // fetch salaries and other data of each job fetched above
  for(let i = 0; i<hrefs.length ; i++){
  Promises.push(browser.newPage().then(async page => {
    await page.goto(hrefs[i] , {
      timeout: 3000000
    });
    // salary fetching
    const salary = await page.waitFor('.job-page .job-summary .salary-info dd')
    const text = await (await salary.getProperty('textContent')).jsonValue();
    if(text.trim() !='Confidential' && !text.includes('Confidential')){

      // job title 
      const jobTitle = await page.waitFor('h1.job-title'); 
      const jobTitleText = await (await jobTitle.getProperty('textContent')).jsonValue(); 

      // company name
      const companyName = await page.waitFor('p.job-subinfo'); 
      const companyNameText = await (await companyName.getProperty("textContent")).jsonValue(); 
      const trimmedCompanyNameText = companyNameText.replace(/(\r\n\t|\n|\r\t)/gm,"");

      // logo url 
      const companyLogo = await page.waitFor('a.company-logo img'); 
      const companyLogoURL = await (await companyLogo.getProperty('src')).jsonValue(); 

      // constructing a new Job object and pushing it to an array of jobs.
      let job = new Job(jobTitleText.trim() , text.trim() , trimmedCompanyNameText.trim() , hrefs[i] , companyLogoURL);
      Jobs.push(job); 
    }
  }))
}
  await Promise.all(Promises); 

  savingData(Jobs);

  // pushing newest jobs to firebase
  const firebasePromises = []; 
  Jobs.forEach(job =>{
    let JobObject= {
      salary : job.salary,
      title : job.title , 
      company : job.company,
      url : job.url,
      imgURL : job.imgURL,
    }
    firebasePromises.push(firestore.collection("Jobs").add(JobObject));
  })
  await Promise.all(firebasePromises); 
  console.log("FINISHED CRAWLING AND UPDATED DATABASE"); 

  // closing the browser and ending the application
  await browser.close(); 

})()



function savingData(Data){
// just consoling the data.
  Data.forEach(job =>{
    console.log(job.url); 
  })
  // TODO: implement your own way of saving the jobs, maybe send it to a firebase repo like i do or
  // send it to your own website as an rest api or to a database
}