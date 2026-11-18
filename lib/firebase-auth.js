import {createRemoteJWKSet,jwtVerify} from 'jose';
export function firebaseConfig(){return {apiKey:process.env.FIREBASE_API_KEY||'AIzaSyCxL7VZbUCkKZNpQ0MCXPdVrqjGNsvtpyE',projectId:process.env.FIREBASE_PROJECT_ID||'lean-journal-a7c57',authDomain:process.env.FIREBASE_AUTH_DOMAIN||'lean-journal-a7c57.firebaseapp.com'}}
const jwks=createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
export async function verifyFirebaseToken(token,{keySet=jwks,lookup=fetch,config=firebaseConfig()}={}){
 if(typeof token!=='string'||token.length>12000||token.split('.').length!==3)throw Error('Invalid token');
 const {payload:p}=await jwtVerify(token,keySet,{algorithms:['RS256'],issuer:'https://securetoken.google.com/'+config.projectId,audience:config.projectId,requiredClaims:['sub','exp','iat','auth_time'],maxTokenAge:'1h',clockTolerance:30});
 const now=Math.floor(Date.now()/1000);if(!p.sub||p.sub.length>128||p.email_verified!==true||typeof p.email!=='string'||typeof p.auth_time!=='number'||p.auth_time>now+30)throw Error('Verified email required');
 const r=await lookup('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+encodeURIComponent(config.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token}),signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error('Login expired');const u=(await r.json()).users?.[0];
 if(!u||u.localId!==p.sub||u.disabled||u.emailVerified!==true||u.email?.toLowerCase()!==p.email.toLowerCase()||Number(u.validSince||0)>p.auth_time)throw Error('Login expired');
 return {uid:p.sub,email:p.email.toLowerCase()};
}
