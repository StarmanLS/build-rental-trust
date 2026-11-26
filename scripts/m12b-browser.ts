import {strict as assert} from 'node:assert';
import {mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {join} from 'node:path';
import {chromium,type Page} from 'playwright';
import sharp from 'sharp';

// Runs only against the local synthetic preview; it never handles real records.
const origin='http://localhost:5199';
const out=join(process.cwd(),'docs/evidence/0009');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1280,height:900},baseURL:origin});
const page=await context.newPage();
const consoleErrors:string[]=[];
const failedRequests:string[]=[];
page.on('pageerror',error=>consoleErrors.push(error.message));
page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('/_next/hmr')&&!message.text().includes('status of 401')&&!message.text().includes('status of 404'))consoleErrors.push(message.text())});
page.on('response',response=>{if(response.status()>=500)failedRequests.push(`${response.status()} ${response.url()}`)});

async function landlord(){
 await page.goto(origin);
 await page.getByRole('button',{name:'Landlord',exact:true}).click();
 await page.getByRole('button',{name:/I’m a landlord/}).click();
 await page.getByRole('heading',{name:/Hi, Aina/}).waitFor();
}
async function openProperty(){
 const card=page.locator('.property-card').filter({has:page.getByRole('heading',{name:'Taman Melati · 18'})});
 await card.getByRole('button',{name:'Verification & photos'}).click();
 await page.getByRole('heading',{name:/Verification & photos/}).waitFor();
}
async function signOut(){await page.getByRole('button',{name:'Sign out'}).click();await page.getByRole('heading',{name:'Welcome to Rental Trust'}).waitFor()}
async function reviewer(){
 await page.getByRole('textbox',{name:'Email address'}).fill('reviewer@example.invalid');
 await page.getByLabel('Password').fill('LocalRental!2026');
 await page.getByRole('button',{name:'Log in'}).click();
 await page.getByRole('button',{name:/I’m a landlord/}).click();
 await page.getByRole('button',{name:'Reviews',exact:true}).click();
 await page.getByRole('heading',{name:'Property claims for review'}).waitFor();
}
async function request(path:string,data:unknown){return page.request.post(origin+'/api/v1'+path,{headers:{Origin:origin},data})}

try{
 await landlord();
 const dashboard=await (await page.request.get(origin+'/api/v1/dashboard')).json();
 const pid=dashboard.properties.find((p:any)=>p.label==='Taman Melati · 18').id as string;
 await openProperty();
 const initial=await (await page.request.get(origin+`/api/v1/properties/${pid}/verification`)).json();
 if(initial.claim?.review_status!=='document_reviewed')await page.getByRole('button',{name:'Save relationship'}).click();
 const stamp=Date.now();
 const docName=`management-agreement-${stamp}.txt`;
 const doc=Buffer.from(`Synthetic property management agreement ${stamp} for browser workflow testing. No real person or property is represented.`);
 await page.locator('form').filter({has:page.getByRole('button',{name:'Add evidence'})}).locator('input[type="file"]').setInputFiles({name:docName,mimeType:'text/plain',buffer:doc});
 await page.locator('form').filter({has:page.getByRole('button',{name:'Add evidence'})}).locator('input[type="checkbox"]').check();
 await page.getByRole('button',{name:'Add evidence'}).click();
 await page.getByText(new RegExp(docName)).waitFor();
 await page.getByRole('button',{name:'Submit for review'}).click();
 await page.getByText('Pending review',{exact:true}).first().waitFor();
 await page.screenshot({path:join(out,'01-landlord-pending.png')});
 await page.reload();await openProperty();
 await page.getByText('Pending review',{exact:true}).first().waitFor();
 const docId=(await page.locator('.property-evidence-list button').first().count())>0;
 assert.equal(docId,true);
 await page.getByRole('button',{name:'Close dialog'}).click();
 assert.equal((await request(`/properties/${pid}/verification/decision`,{checkType:'rental_authority',decision:'document_reviewed',reason:'Claimant cannot self-approve'})).status(),403);
 await signOut();
 await reviewer();
 const claim=page.locator('.tenancy-card').filter({has:page.getByRole('heading',{name:'Taman Melati · 18'})});
 await claim.getByRole('button',{name:'Open review'}).click();
 await claim.locator('.property-evidence-list li').filter({hasText:docName}).getByRole('button',{name:'View evidence'}).click();
 await claim.getByText(new RegExp(`Synthetic property management agreement ${stamp}`)).waitFor();
 await claim.getByLabel('Check').selectOption('rental_authority');
 await claim.getByLabel('Decision').selectOption('more_information_required');
 await claim.getByLabel('Reason').fill('Please clarify the authority granted in this agreement.');
 await claim.getByRole('button',{name:'Save decision'}).click();
 await page.waitForFunction(()=>document.querySelector('.tenancy-card > p')?.textContent?.includes('More information required'));
 await page.screenshot({path:join(out,'02-reviewer-correction.png')});
 assert.match(await claim.innerText(),/More information required/);
 await claim.getByLabel('Decision').selectOption('document_reviewed');
 await claim.getByLabel('Reason').fill('The supplied management agreement was reviewed for this local test.');
 await claim.getByRole('button',{name:'Save decision'}).click();
 await page.waitForFunction(()=>document.querySelector('.tenancy-card > p')?.textContent?.includes('Documents reviewed'));
 await signOut();
 await landlord();
 await openProperty();
 await page.getByText('Documents reviewed',{exact:true}).first().waitFor();
 // Retire only photos from earlier runs of this synthetic browser check.
 const beforePhotos=(await (await page.request.get(origin+`/api/v1/properties/${pid}/verification`)).json()).photos as {id:string,filename:string}[];
 for(const photo of beforePhotos.filter(photo=>/^(living|kitchen)-\d+\.(jpg|png)$/.test(photo.filename))){
  const removed=await request(`/property-photos/${photo.id}`,{action:'remove'});
  assert.equal(removed.status(),200,await removed.text());
 }
 await page.reload();await openProperty();
 const imageA=await sharp({create:{width:120,height:90,channels:3,background:'#b6b79c'}}).composite([{input:Buffer.from(`<svg width="120" height="90"><rect x="12" y="12" width="60" height="60" fill="#${randomBytes(3).toString('hex')}"/></svg>`)}]).jpeg().toBuffer();
 const imageB=await sharp({create:{width:120,height:90,channels:3,background:'#9daebc'}}).composite([{input:Buffer.from(`<svg width="120" height="90"><rect x="40" y="12" width="60" height="60" fill="#${randomBytes(3).toString('hex')}"/></svg>`)}]).png().toBuffer();
 const photoForm=page.locator('form').filter({has:page.getByRole('button',{name:'Add photo'})});
 await photoForm.getByRole('textbox',{name:'Room or area'}).fill('Living room');
 await photoForm.locator('input[type="file"]').setInputFiles({name:`living-${stamp}.jpg`,mimeType:'image/jpeg',buffer:imageA});
 await photoForm.locator('input[type="checkbox"]').check();
 const [firstUpload]=await Promise.all([page.waitForResponse(r=>r.url().endsWith(`/properties/${pid}/photos`)&&r.request().method()==='POST'),photoForm.getByRole('button',{name:'Add photo'}).click()]);
 assert.equal(firstUpload.status(),201,await firstUpload.text());
 const firstId=(await firstUpload.json()).id as string;
 await page.locator(`.property-photo:has(img[src*="${firstId}"])`).waitFor();
 await photoForm.getByRole('textbox',{name:'Room or area'}).fill('Kitchen');
 await photoForm.locator('input[type="file"]').setInputFiles({name:`kitchen-${stamp}.png`,mimeType:'image/png',buffer:imageB});
 await photoForm.locator('input[type="checkbox"]').check();
 const [secondUpload]=await Promise.all([page.waitForResponse(r=>r.url().endsWith(`/properties/${pid}/photos`)&&r.request().method()==='POST'),photoForm.getByRole('button',{name:'Add photo'}).click()]);
 assert.equal(secondUpload.status(),201,await secondUpload.text());
 const secondId=(await secondUpload.json()).id as string;
 const kitchen=page.locator(`.property-photo:has(img[src*="${secondId}"])`);
 await kitchen.getByRole('button',{name:'Save label'}).waitFor();
 await kitchen.getByRole('textbox',{name:'Room or area'}).fill('Dining area');
 await kitchen.getByRole('button',{name:'Save label'}).click();
 const dining=page.locator(`.property-photo:has(img[src*="${secondId}"])`);
 const orderBefore=await page.locator('.property-photo img').evaluateAll(images=>images.map(image=>image.getAttribute('src')||''));
 const previousIndex=orderBefore.findIndex(src=>src.includes(secondId));
 assert.ok(previousIndex>0);
 await dining.getByRole('button',{name:'Move earlier'}).click();
 await page.waitForFunction(({id,previousIndex})=>Array.from(document.querySelectorAll('.property-photo img')).findIndex(img=>img.getAttribute('src')?.includes(id))===previousIndex-1,{id:secondId,previousIndex});
 await dining.getByRole('button',{name:'Set cover'}).click();
 await page.waitForFunction(id=>{const image=Array.from(document.querySelectorAll('.property-photo img')).find(img=>img.getAttribute('src')?.includes(id));return image?.parentElement?.querySelector('strong')?.textContent?.includes('Cover')},secondId);
 await page.screenshot({path:join(out,'03-photos-desktop.png')});
 await dining.getByRole('button',{name:'Mark outdated'}).click();
 await page.waitForFunction(id=>{const image=Array.from(document.querySelectorAll('.property-photo img')).find(img=>img.getAttribute('src')?.includes(id));return image?.parentElement?.querySelector('strong')?.textContent?.includes('Outdated')},secondId);
 page.once('dialog',dialog=>dialog.accept());
 await dining.getByRole('button',{name:'Remove'}).click();
 await page.locator(`.property-photo:has(img[src*="${secondId}"])`).waitFor({state:'detached'});
 await page.reload();await openProperty();
 await page.locator(`.property-photo:has(img[src*="${firstId}"])`).waitFor();
 assert.equal(await page.locator(`.property-photo:has(img[src*="${secondId}"])`).count(),0);
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:join(out,'04-photos-mobile.png')});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true);
 const outsider=await browser.newContext({baseURL:origin});
 const verification=await (await page.request.get(origin+`/api/v1/properties/${pid}/verification`)).json();
 const outsiderResponse=await outsider.request.get(origin+`/api/v1/property-evidence/${verification.evidence[0].id}/download`);
 assert.equal(outsiderResponse.status(),401);
 await outsider.close();
 assert.equal(consoleErrors.length,0,consoleErrors.join('\n'));
 assert.equal(failedRequests.length,0,failedRequests.join('\n'));
 console.log('Browser workflow passed: pending, refresh, reviewer correction/review, photos, mobile, unauthorized access');
 console.log('Screenshots:',out);
}finally{await browser.close()}
