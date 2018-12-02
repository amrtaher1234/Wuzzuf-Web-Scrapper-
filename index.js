const puppeteer = require('puppeteer');


function delay(num){
  return new Promise((resp , rej)=>{
    setTimeout(() => {
      resp(); 
    }, num);
  })
}

class Job{
  constructor(title , salary , company){
    this.title = title ; 
    this.company = company ; 
    this.salary = salary ; 
  }
}

(async () => {
  const browser = await puppeteer.launch(
    {executablePath:"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe" , headless : true})
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto('https://wuzzuf.net/explore')
  // signing into my website:D
  const email = await page.waitFor('#input-signin-email');
  const password = await page.waitFor("#input-signin-password"); 
  const signbtn = await page.waitFor('.btn-signin'); 
  await email.type(""); 
  await password.type("");
  await signbtn.click(); 
  

  const k = await page.waitFor('.css-p0kzya'); 

  await page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight);
  });


  // to scroll down
  for(let i =0; i<2; i++){
  await page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight);
  });
  await delay(1500); 
}

  const hrefs = await page.evaluate(() => {
    const anchors = document.querySelectorAll('a.css-1lwywsz');
    return [].map.call(anchors, a => a.href);
  });
  console.log(hrefs); 
  let salaries = [];  
  let Jobs = [] ;
  const Promises = []; 

  for(let i = 0; i<hrefs.length ; i++){
  Promises.push(browser.newPage().then(async page => {
    await page.goto(hrefs[i]);
    const salary = await page.waitFor('.job-page .job-summary .salary-info dd')
    const text = await (await salary.getProperty('textContent')).jsonValue();
    if(text.trim() !='Confidential'){
      const jobTitle = await page.waitFor('h1.job-title'); 
      const jobTitleText = await (await jobTitle.getProperty('textContent')).jsonValue(); 

      const companyName = await page.waitFor('p.job-subinfo'); 
      const companyNameText = await (await companyName.getProperty("textContent")).jsonValue(); 
      const trimmedCompanyNameText = companyNameText.replace(/(\r\n\t|\n|\r\t)/gm,"");

      let job = new Job(jobTitleText.trim() , text.trim() , trimmedCompanyNameText.trim());
      Jobs.push(job); 
    }
  }))
}
  await Promise.all(Promises); 
  console.log(Jobs); 

  await browser.close(); 

})()