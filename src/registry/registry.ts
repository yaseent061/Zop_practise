import client from 'prom-client';
const register = new client.Registry();


const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'status', 'path']
  });
  
  register.registerMetric(httpRequestsTotal);


export {register , httpRequestsTotal} ;