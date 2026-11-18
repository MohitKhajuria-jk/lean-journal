import {createRouter} from '../lib/router.js';
import {Readable} from 'node:stream';
const route=createRouter();
export default async function handler(req,res){const origin='https://'+(req.headers.host||'lean-journal.vercel.app');const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v!=null)headers.set(k,Array.isArray(v)?v.join(','):v);const request=new Request(new URL(req.url,origin),{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});const response=await route(request);res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(Buffer.from(await response.arrayBuffer()))}
