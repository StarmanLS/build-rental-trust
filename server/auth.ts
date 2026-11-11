import { betterAuth } from 'better-auth';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { randomUUID } from 'node:crypto';
import type { openDatabase,openPostgres } from './db';
import * as schema from './schema';
export function createAuth(db:Awaited<ReturnType<typeof openDatabase>>|Awaited<ReturnType<typeof openPostgres>>,secret:string,baseURL:string){
 const mail=async(email:string,subject:string,url:string)=>{await db.pg.query('INSERT INTO mail(id,recipient,subject,link) VALUES($1,$2,$3,$4)',[randomUUID(),email,subject,url]);};
 return betterAuth({appName:'Rental Trust Local',baseURL,secret,trustedOrigins:[baseURL],database:drizzleAdapter(db.orm,{provider:'pg',schema}),
 hooks:{before:createAuthMiddleware(async ctx=>{if(ctx.body?.email && !String(ctx.body.email).toLowerCase().endsWith('@example.invalid'))throw new APIError('BAD_REQUEST',{message:'This local preview accepts fictional @example.invalid email addresses only.'});})},
 emailAndPassword:{enabled:true,requireEmailVerification:true,minPasswordLength:12,revokeSessionsOnPasswordReset:true,sendResetPassword:async({user,url})=>mail(user.email,'Reset your local test password',url)},
 emailVerification:{sendOnSignUp:true,autoSignInAfterVerification:true,sendVerificationEmail:async({user,url})=>mail(user.email,'Verify your test email',url)},
 session:{expiresIn:60*60*8,cookieCache:{enabled:false}},
 rateLimit:{enabled:true,window:60,max:60},
 advanced:{useSecureCookies:false}
 });
}
